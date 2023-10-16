#!/bin/bash

mongo << EOF
var config = {
  "_id": "mongo-set",
  "version": 1,
  "members": [
    {
      "_id": 1,
      "host": "mongo_node1:27017",
      "priority": 3
    },
    {
      "_id": 2,
      "host": "mongo_node2:27017",
      "priority": 2
    },
    {
      "_id": 3,
      "host": "mongo_node3:27017",
      "priority": 1
    },

  ]
};
rs.initiate(config, {force: true}};
rs.status();
EOF
