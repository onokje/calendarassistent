const dateDiffString = require('./dateDiffHelper.js');

function convertUTCDateToLocalDate(date) {
  const newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

function getMeetingViewVars(meetingRaw) {
  const now = new Date();

  const newStartDate = convertUTCDateToLocalDate(new Date(meetingRaw.start.dateTime));
  const newEndDate = convertUTCDateToLocalDate(new Date(meetingRaw.end.dateTime));

  const diff = dateDiffString(newStartDate, now);

  const alert = diff.d === 0 && diff.h === 0 && diff.m < 5 && diff.m >= 0;
  const meetingIsNow = diff.isNeg;

  const meetingDuration = dateDiffString(new Date(meetingRaw.end.dateTime), new Date(meetingRaw.start.dateTime));

  return {
    meeting: true,
    subject : meetingRaw.subject,
    isAllDay : meetingRaw.isAllDay,
    startTime : newStartDate.toLocaleTimeString(),
    endTime : newEndDate.toLocaleTimeString(),
    startsIn : diff.str,
    location : meetingRaw.location.displayName,
    meetingAlert : alert,
    meetingIsNow : meetingIsNow,
    meetingDuration: meetingDuration.str
  }

}

module.exports = getMeetingViewVars;