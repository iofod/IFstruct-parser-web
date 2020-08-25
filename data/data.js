exports.data = {
  "appid": "feb7b63985850856bf0dfaa7b4b50d1a",
  "CTT": {
    "currentUnlockSets": null,
    "custom": [],
    "rulerLines": {
      "pageDefault": [],
      "P1589694351": [],
      "P1589694373": []
    },
    "routerPaths": {},
    "T": {
      "pages": [
        "pageDefault",
        "P1589694351",
        "P1589694373"
      ],
      "HSS": {
        "padding": {
          "type": "padding",
          "name": "默认",
          "content": "",
          "lock": false,
          "children": [],
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true
                },
                "style": {}
              }
            }
          ],
          "remarks": "",
          "events": []
        },
        "Global": {
          "type": "level",
          "name": "母版",
          "lock": false,
          "parent": null,
          "children": [],
          "content": "base/level",
          "remarks": "",
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true,
                  "ghost": true
                },
                "style": {}
              }
            }
          ],
          "events": []
        },
        "pageDefault": {
          "type": "page",
          "name": "pageDefault",
          "lock": false,
          "parent": null,
          "children": [
            "levelDefault"
          ],
          "content": "",
          "remarks": "",
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true
                },
                "style": {
                  "left": "0px",
                  "top": "0px"
                }
              }
            }
          ],
          "events": []
        },
        "levelDefault": {
          "type": "level",
          "name": "levelDefault",
          "lock": false,
          "parent": "pageDefault",
          "children": [
            "c1589679809",
            "c1589679816"
          ],
          "content": "base/level",
          "remarks": "",
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true,
                  "ghost": false
                },
                "style": {}
              }
            }
          ],
          "events": []
        },
        "c1589679809": {
          "name": "容器",
          "type": "container",
          "lock": false,
          "parent": "levelDefault",
          "children": [],
          "content": "base/container",
          "remarks": "",
          "status": [
            {
              "name": "default",
              "id": "default",
              "active": true,
              "props": {
                "option": {
                  "V": true,
                  "value": ""
                },
                "style": {
                  "backgroundColor": "#A4EFD9",
                  "width": "325px",
                  "height": "325px",
                  "borderRadius": "280px 280px 280px 280px",
                  "boxShadow": "0px 0px 10px 1px rgba(0,0,0,.1), 0px 0px 0px 0px #000 inset"
                },
                "d": 0,
                "x": 473,
                "y": 377
              }
            }
          ],
          "model": {},
          "events": [
            {
              "name": "click - 点击",
              "event": "click",
              "actions": [
                {
                  "fn": "router",
                  "active": true,
                  "params": {
                    "target": "P1589694351",
                    "during": 300,
                    "transition": "slide"
                  }
                }
              ],
              "native": true,
              "expand": true,
              "select": []
            }
          ]
        },
        "c1589679816": {
          "name": "容器",
          "type": "container",
          "lock": false,
          "parent": "levelDefault",
          "children": [
            "u1589683826"
          ],
          "content": "base/container",
          "remarks": "",
          "status": [
            {
              "name": "default",
              "id": "default",
              "active": true,
              "props": {
                "option": {
                  "V": true,
                  "value": ""
                },
                "style": {
                  "backgroundColor": "#C0FF88"
                },
                "d": 0,
                "x": 886,
                "y": 570
              }
            }
          ],
          "model": {},
          "events": []
        },
        "u1589683826": {
          "name": "文本",
          "type": "unit",
          "lock": false,
          "parent": "c1589679816",
          "children": [],
          "content": "base/text",
          "remarks": "",
          "status": [
            {
              "name": "default",
              "id": "default",
              "active": true,
              "props": {
                "option": {
                  "V": true,
                  "value": ""
                },
                "style": {},
                "d": 340,
                "x": 99,
                "y": 38
              }
            }
          ],
          "model": {
            "msg": {
              "value": "文本",
              "subscribe": "",
              "ZI": 0
            }
          },
          "events": []
        },
        "P1589694351": {
          "name": "page2",
          "type": "page",
          "parent": null,
          "content": "",
          "lock": false,
          "children": [
            "L1589694354"
          ],
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 3924.782765610645,
                "y": 127.01179082051294,
                "d": 0,
                "option": {
                  "V": true
                },
                "style": {
                  "left": "3924.782765610645px",
                  "top": "127.01179082051294px"
                }
              }
            }
          ],
          "remarks": "",
          "events": []
        },
        "L1589694354": {
          "name": "level1",
          "type": "level",
          "parent": "P1589694351",
          "content": "base/level",
          "lock": false,
          "children": [
            "c1589694358"
          ],
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true,
                  "ghost": false
                },
                "style": {}
              }
            }
          ],
          "remarks": "",
          "events": []
        },
        "c1589694358": {
          "name": "容器",
          "type": "container",
          "lock": false,
          "parent": "L1589694354",
          "children": [],
          "content": "base/container",
          "remarks": "",
          "status": [
            {
              "name": "default",
              "id": "default",
              "active": true,
              "props": {
                "option": {
                  "V": true,
                  "value": ""
                },
                "style": {
                  "backgroundColor": "#63D3EA",
                  "width": "525px",
                  "height": "262px"
                },
                "d": 0,
                "x": 272,
                "y": 409
              }
            }
          ],
          "model": {},
          "events": [
            {
              "name": "click - 点击",
              "event": "click",
              "actions": [
                {
                  "fn": "router",
                  "active": true,
                  "params": {
                    "target": "P1589694373",
                    "during": 300,
                    "transition": "slide"
                  }
                }
              ],
              "native": true,
              "expand": true,
              "select": []
            }
          ]
        },
        "P1589694373": {
          "name": "page3",
          "type": "page",
          "parent": null,
          "content": "",
          "lock": false,
          "children": [
            "L1589694375"
          ],
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 2117.004037208166,
                "y": 2933.9762579569815,
                "d": 0,
                "option": {
                  "V": true
                },
                "style": {
                  "left": "2117.004037208166px",
                  "top": "2933.9762579569815px"
                }
              }
            }
          ],
          "remarks": "",
          "events": []
        },
        "L1589694375": {
          "name": "level1",
          "type": "level",
          "parent": "P1589694373",
          "content": "base/level",
          "lock": false,
          "children": [
            "c1589694377"
          ],
          "model": {},
          "status": [
            {
              "name": "default",
              "active": true,
              "props": {
                "x": 0,
                "y": 0,
                "d": 0,
                "option": {
                  "V": true,
                  "ghost": false
                },
                "style": {}
              }
            }
          ],
          "remarks": "",
          "events": []
        },
        "c1589694377": {
          "name": "容器",
          "type": "container",
          "lock": false,
          "parent": "L1589694375",
          "children": [],
          "content": "base/container",
          "remarks": "",
          "status": [
            {
              "name": "default",
              "id": "default",
              "active": true,
              "props": {
                "option": {
                  "V": true,
                  "value": ""
                },
                "style": {
                  "backgroundColor": "#FF64B3"
                },
                "d": 0,
                "x": 363,
                "y": 390
              }
            }
          ],
          "model": {},
          "events": [
            {
              "name": "click - 点击",
              "event": "click",
              "actions": [
                {
                  "fn": "router",
                  "active": true,
                  "params": {
                    "target": "pageDefault",
                    "during": 300,
                    "transition": "slide"
                  }
                }
              ],
              "native": true,
              "expand": true,
              "select": []
            }
          ]
        }
      }
    }
  },
  "Models": {
    "table": {},
    "Fx": {
      "FN_demo": {
        "key": "FN_demo",
        "value": "next()",
        "pid": "FN_demo"
      }
    },
    "MF": {
      "MF_demo": {
        "key": "MF_demo",
        "value": "\nlet output = {\n}\nsetTimeout(() => {\n    // __h__('USER_DATA_2', output)\n    next(output)\n}, 100)\n\n        "
      }
    },
    "util": {
      "u1": {
        "key": "u1",
        "value": "//test1"
      }
    },
    "connectRangeSets": []
  },
  "Config": {
    "setting": {
      "title": "",
      "keywords": "",
      "description": "",
      "mainPage": "pageDefault",
      "pageMode": "single",
      "incognitoMode": false,
      "publishPath": "",
      "publishDec": "",
      "publishContext": "test",
      "version": "0.0.1",
      "headHook": "",
      "bodyHook": ""
    },
    "backups": {
      "publishHistory": [],
      "versionList": []
    }
  },
  "update_time": 1589806459
}