const getMeetingViewVars = require('./meetingHelper');

const express = require('express');
const router = express.Router();
const passport = require('passport');
const graphHelper = require('./graphHelper.js');
const statusHelper = require('./statusHelper');
const sensor = require('node-dht-sensor');
const request = require('request');

// Get the home page.
router.get('/', (req, res) => {
    // check if user is authenticated
    if (!req.isAuthenticated()) {
        res.render('login');
    } else {
        renderMainpage(req, res);
    }
});

router.get('/test', (req, res) => {
    res.render('clock', {
        nextMeeting: {
            meeting: true,
            subject: 'test meeting 3',
            isAllDay: false,
            startTime: (new Date()).toLocaleTimeString('nl-NL'),
            endTime: (new Date()).toLocaleTimeString('nl-NL'),
            startsIn: '1 uur, 10 minuten',
            location: 'Magazine Mansion 2',
            meetingAlert: false,
            meetingIsNow: false,
            meetingDuration: '30 minuten'
        },
        customAlert: 'Ik werk thuis vandaag, slack gerust! AUB AUB AUB',
        colorStatus: 'warn',
    });
});

// Load the sendMail page.
function renderMainpage(req, res) {

    graphHelper.getCalendar(req.user.accessToken, (err, calendarResponse) => {
        if ((err && hasAccessTokenExpired(err)) || !calendarResponse || !calendarResponse.body || !calendarResponse.body.value) {
            res.redirect('/login');
            return;
        }
        calendarResponse = calendarResponse.body;

        if (err) {
            renderError(err, res);
        }

        statusHelper.getStatus((err, statusResponse) => {
            if (err || !statusResponse || !statusResponse.status) {
                renderError(err, res);
                return;
            }

            sensor.read(22, 14, function (err, temperature, humidity) {
                if (!err) {
                    let colorStatus = 'normal';
                    let ledColor = '0,60,100';
                    let customAlert = null;

                    if (statusResponse.status === 'dnd') {
                        colorStatus = 'warn';
                        ledColor = '100,50,0';
                        customAlert = 'NIET STOREN A.U.B.';
                    }

                    if (statusResponse.status === 'workHome') {
                        colorStatus = 'warn';
                        ledColor = '100,50,0';
                        customAlert = 'Ik werk thuis vandaag, slack gerust!';
                    }

                    if (statusResponse.status === 'off') {
                        colorStatus = 'alert';
                        ledColor = '60,50,10';
                        customAlert = 'Ik ben niet aan het werk momenteel.';
                    }

                    const nextMeeting = calendarResponse.value[0];
                    const meetingVars = !calendarResponse.value.length ? {meeting: false} : getMeetingViewVars(nextMeeting);

                    if (meetingVars.meetingAlert) {
                        colorStatus = 'alert';
                        ledColor = '150,0,0';
                    }

                    if (meetingVars.meetingIsNow) {
                        colorStatus = 'warn';
                        ledColor = '100,50,0';
                    }

                    request({
                        uri: 'http://localhost:1880/led',
                        method: 'POST',
                        json: {'color': ledColor}
                    });

                    res.render('clock', {
                        temp: temperature.toFixed(1),
                        hum: humidity.toFixed(1),
                        customAlert: customAlert,
                        colorStatus: colorStatus,
                        nextMeeting: meetingVars
                    });

                } else {
                    renderError('temp sensor error');
                }
            });

        });

    });

}

// Authentication request.
router.get('/login',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect('/');
    });

// Authentication callback.
// After we have an access token, get user data and load the sendMail page.
router.get('/token',
    passport.authenticate('azuread-openidconnect', {failureRedirect: '/'}),
    (req, res) => {
        graphHelper.getUserData(req.user.accessToken, (err, user) => {
            if (!err) {
                req.user.profile.displayName = user.body.displayName;
                req.user.profile.emails = [{address: user.body.mail || user.body.userPrincipalName}];
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
