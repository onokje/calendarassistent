function dateDiffString(date1, date2) {
  const diffMs = (date1 - date2);
  const diffDays = Math.floor(diffMs / 86400000); // days
  const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
  const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

  let timestring = '';
  if (diffDays > 0) {
    timestring += diffDays + ' dagen, ';
  }
  if (diffHrs > 0) {
    timestring += diffHrs + ' uur, ';
  }
  timestring += diffMins + (diffMins === 1 ? 'minuut' : ' minuten');

  return {
    d: diffDays,
    h: diffHrs,
    m: diffMins,
    isNeg : diffDays < 0 || diffHrs < 0 || diffMins < 0,
    str : timestring
  }
}

module.exports = dateDiffString;
