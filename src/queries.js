// TODO: Sanitize string input of buckets

function windowTimelineQuery(starttime, endtime, windowbucket, afkbucket){
  return {
    "timeperiods": [starttime+"/"+endtime],
    "query": [
      'not_afk = query_bucket("'+afkbucket+'");',
      'events  = query_bucket("'+windowbucket+'");',
      'not_afk = filter_keyvals(not_afk, "status", "not-afk");',
      'events  = filter_period_intersect(events, not_afk);',
      'events  = sort_by_timestamp(events);',
      'RETURN  = events;',
  ]};
}

function appSummaryQuery(starttime, endtime, windowbucket, afkbucket, count){
  return {
    "timeperiods": [starttime+"/"+endtime],
    "query": [
      'not_afk = query_bucket("'+afkbucket+'");',
      'events  = query_bucket("'+windowbucket+'");',
      'not_afk = filter_keyvals(not_afk, "status", "not-afk");',
      'events  = filter_period_intersect(events, not_afk);',
      'events  = merge_events_by_keys(events, "app");',
      'events  = sort_by_duration(events);',
      'events  = limit_events(events, '+count+');',
      'RETURN  = events;',
  ]};
}

function titleSummaryQuery(starttime, endtime, windowbucket, afkbucket, count){
  return {
    "timeperiods": [starttime+"/"+endtime],
    "query": [
      'not_afk=query_bucket("'+afkbucket+'");',
      'events=query_bucket("'+windowbucket+'");',
      'not_afk=filter_keyvals(not_afk, "status", "not-afk");',
      'events=filter_period_intersect(events, not_afk);',
      'events=merge_events_by_keys(events, "app", "title");',
      'events=sort_by_duration(events);',
      'events=limit_events(events, '+count+');',
      'RETURN=events;',
  ]};
}

function browserSummaryQuery(starttime, endtime, browserbucket, windowbucket, afkbucket, count){
  var browser_appnames = "";
  if (browserbucket.endsWith("-chrome")){
    browser_appnames = '"Google-chrome", "chrome.exe", "Chromium", "Google Chrome"';
  } else if (browserbucket.endsWith("-firefox")){
    browser_appnames = '"Firefox", "Firefox.exe", "firefox"';
  }
  return {
    "timeperiods": [starttime+"/"+endtime],
    "query": [
      'events=query_bucket("'+browserbucket+'");',
      'not_afk=query_bucket("'+afkbucket+'");',
      'not_afk=filter_keyvals(not_afk, "status", "not-afk");',
      'window_browser=query_bucket("'+windowbucket+'");',
      'window_browser=filter_keyvals(window_browser, "app", '+browser_appnames+');',
      'window_browser=filter_period_intersect(window_browser, not_afk);',
      'events=filter_period_intersect(events, window_browser);',
      'events=split_url_events(events);',
      'events=merge_events_by_keys(events, "domain");',
      'events=sort_by_duration(events);',
      'events=limit_events(events, '+count+');',
      'RETURN=events;',
  ]};
}

function dailyActivityQuery (periods, afkbucket){
  return {
    "timeperiods": periods,
    "query": [
      'afkbucket="'+afkbucket+'";',
      'not_afk=query_bucket(afkbucket);',
      'not_afk=merge_events_by_keys(not_afk, "status");',
      'RETURN=not_afk;'
    ]
  }
}

module.exports = {
    "windowTimelineQuery": windowTimelineQuery,
    "appSummaryQuery": appSummaryQuery,
    "titleSummaryQuery": titleSummaryQuery,
    "browserSummaryQuery": browserSummaryQuery,
    "dailyActivityQuery": dailyActivityQuery,
}