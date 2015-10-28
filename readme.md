CLI for sending events to segment.com  Sometime you need to replay events, trigger traits on a list of users. This tool is great for that.

## Install

`npm install -g segio`

It requires that you have your `SEGMENT_WRITE_KEY` as an environment variable when this command is run.

### Identify

#### Trigger Idenify via text user list


Assume users.txt:
```
pam
jim
michael

```

```
cat users.txt | segio identify --traits '{"office": "scranton", "status": "employed"}'
```

```
analytics.identify({
  userId: 'pam', // stdin
  traits: {
    office: "scranton",
    status: "employed"
  }
});
```

#### Trigger Identify via json user / traits list

You can use line delimited json, in the same format as [the docs expect](https://segment.com/docs/libraries/node/#identify)

Assume users.json:
```
{"userId": "pam", "traits":{ "job": "office manager", "status": "employed"}}
{"userId": "jim", "traits":{ "job": "sales", "status": "employed"}}
{"userId": "michael","traits":{ "job": "manager", "status": "retired"}}
{"userId": "ryan", "traits":{ "job": "sales", "status": "fired"}}
```

```
cat users.json | segio identify -f json
```

```
analytics.identify({
  userId: 'pam', // parsed json stdin.
  traits: {
    office: "scranton"
  }
});
```

### Track

#### Trigger track via text user list


Assume users.txt:
```
pam
jim
michael
```

```
cat users.txt | segio track --event 'Pranked Dwight' --properties '{"prank": "stapler in jello"}'
```

Is the equivalent of this call on each of the users piped in via stdin. `--properties` is optional

```
analytics.track({
  userId: 'pam', // username form stdin
  event: 'Pranked Dwight',
  properties: {'prank': 'stapler in jello'},
});
```

#### Trigger track via json list

You can use line delimited JSON, in the same format as [the docs expect](https://segment.com/docs/libraries/node/#track)

Assume users.json:
```
{"userId": "pam", "event": "Pranked Dwight" "properties":{ "prank": "stapler in jello"}}
{"userId": "jim", "event": "Pranked Dwight" "properties":{ "prank": "fax from future"}}
{"userId": "michael", "event": "Pranked Dwight" "properties":{ "prank": "friendship"}}
```

```
cat users.json | segio track -f json
```

```
analytics.track({
  userId: 'pam', // username form stdin
  event: 'Pranked Dwight',
  properties: {'prank': 'stapler in jello'},
});
```
