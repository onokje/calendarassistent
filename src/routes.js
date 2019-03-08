const getMeetingViewVars = require('./meetingHelper');

const express = require('express');
const router = express.Router();
const passport = require('passport');
const graphHelper = require('./graphHelper.js');
const statusHelper = require('./statusHelper');


// Get the home page.
router.get('/', (req, res) => {
  // check if user is authenticated
  if (!req.isAuthenticated()) {
    res.render('login');
  } else {
    renderMainpage(req, res);
  }
});

router.get('/clock', (req, res) => {
  res.render('clock', {nextMeeting: {
      meeting: true,
      dndAlert: true,
      colorStatus: 'normal', // one of: 'normal', 'alert', 'warn'
      subject : 'test meeting 2',
      isAllDay : false,
      startTime : (new Date()).toLocaleTimeString(),
      endTime : (new Date()).toLocaleTimeString(),
      startsIn : '1 uur, 10 minuten',
      location : 'Magazine Mansion',
      meetingAlert : false,
      meetingIsNow : false,
      meetingDuration: '30 minuten'
    }});
});

// Load the sendMail page.
function renderMainpage(req, res) {

  graphHelper.getCalendar(req.user.accessToken, (err, calendarResponse) => {

    if (err) {
      renderError(err, res);
    }

    statusHelper.getStatus((err, statusResponse) => {

      if (err || !statusResponse || !statusResponse.status) {
        renderError(err, res);
        return;
      }

      let colorStatus = 'normal';
      let customAlert = null;

      if (statusResponse.status === 'dnd') {
        colorStatus = 'warn';
        customAlert = 'NIET STOREN A.U.B.';
      }

      if (statusResponse.status === 'workHome') {
        colorStatus = 'warn';
        customAlert = 'Ik werk thuis vandaag, slack gerust!';
      }

      if (statusResponse.status === 'off') {
        colorStatus = 'alert';
        customAlert = 'Ik ben niet aan het werk momenteel.';
      }

      const nextMeeting = calendarResponse.value[0];
      const meetingVars = !calendarResponse.value.length ? {meeting: false} : getMeetingViewVars(nextMeeting);

      if (meetingVars.meetingAlert) {
        colorStatus = 'alert';
      }

      res.render('clock', {
        display_name: req.user.profile.displayName,
        email_address: req.user.profile.emails[0].address,
        customAlert: customAlert,
        colorStatus: colorStatus,
        nextMeeting: meetingVars
      });
    });

  });

}

// Authentication request.
router.get('/login',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  });

// Authentication callback.
// After we have an access token, get user data and load the sendMail page.
router.get('/token',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
  (req, res) => {
    graphHelper.getUserData(req.user.accessToken, (err, user) => {
      if (!err) {
        req.user.profile.displayName = user.body.displayName;
        req.user.profile.emails = [{ address: user.body.mail || user.body.userPrincipalName }];
        renderMainpage(req, res);
      } else {
        renderError(err, res);
      }
    });
  });

router.get('/disconnect', (req, res) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie('graphNodeCookie');
    res.status(200);
    res.redirect('/');
  });
});

// helpers
function hasAccessTokenExpired(e) {
  let expired;
  if (!e.innerError) {
    expired = false;
  } else {
    expired = e.forbidden &&
      e.message === 'InvalidAuthenticationToken' &&
      e.response.error.message === 'Access token has expired.';
  }
  return expired;
}
/**
 *
 * @param {*} e
 * @param {*} res
 */
function renderError(e, res) {
  e.innerError = (e.response) ? e.response.text : '';
  res.render('error', {
    error: e
  });
}

module.exports = router;
