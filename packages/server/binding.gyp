{
  "targets": [
    {
      "target_name": "sqlite3_collation",
      "sources": [
        "src-cpp/sqlite3_collation.cpp"
      ]
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "sqlite3_collation" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/sqlite3_collation.node" ],
          "destination": "./bin"
        }
      ]
    }
  ]
}
