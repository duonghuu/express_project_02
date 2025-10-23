demo user call custom app register api with data
custom app receive data and send to redis
save user request to db

===
trigger_s2s
call 2 trigger, activity
===


custom app receive request /responsys/register
- responsysController::handleRegister
- ResponsysService.register
  - processContact
    - callContactAPI
      - CALL responsys api rest/api/v1.3/lists/${this.API_PROFILE_LIST}/members
      - retry
- add to queue

===
## table responsys
- log lại thông tin request đến api của CX
  - endpoint, data, datetime

## table call_responsys
- giả lập tình huống gửi data đến api của responsys, log lại thông tin sẽ gửi sang cho responsys
  - endpoint, data, datetime