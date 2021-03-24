<template>
  <v-app>
    <v-app-bar app color="indigo darken-3" dark height="40">
      <div class="d-flex align-center">
        <v-img
          alt="Logo"
          class="shrink mr-2"
          contain
          src="./assets/itemicon_108203.png"
          transition="scale-transition"
          width="40"
        />

        <span class="title"> 周回数計算 </span>
      </div>

      <v-spacer></v-spacer>

      <v-dialog>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-align-vertical-bottom</v-icon>
          </v-btn>
        </template>

        <v-card :style="themeColor">
          <v-card-title>スタミナ1毎に取得できるExp</v-card-title>
          <v-divider></v-divider>
          <v-card-text height="200px" :style="themeColor">
            <span v-if="isLoaded">
              <br />
              <strong>イベント(アイテムは全て金鍵に交換) <br /></strong>
              通常：<br>
              {{ expPerStm1("event",true) }} <br />
              チケットクエを周回しない場合： <br>
              {{ expPerStm1("event") }}<br />
              
              <br />
              <strong>メインクエ <br /></strong>
              アルシーヴ：<br>
              {{ expPerStm1("archive") }} <br />
              スタ半フェンネル： <br>
              {{ expPerStm1("halfFennel") }}<br />
              <br />
            </span>
            <span v-else>データ読み込み中です</span>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
        </template>

        <v-card :style="themeColor">
          <v-card-title>データ</v-card-title>
          <v-divider></v-divider>
          <v-card-text height="200px" :style="themeColor">
            <span v-if="isLoaded">
              イベント名：{{ EventData["Name"] }} <br />
              <br />
              スタミナクエ <br />
              星2素材ドロップ率：
              {{ EventData["stamina"][`rare1`]["itemNums"] }} +
              {{ EventData["stamina"][`rare1`]["itemGroups"] }}B <br />
              星3素材ドロップ率：
              {{ EventData["stamina"][`rare2`]["itemNums"] }} +
              {{ EventData["stamina"][`rare2`]["itemGroups"] }}B <br />
              <br />
              チケットクエ <br />
              星2素材ドロップ率：
              {{ EventData["ticket"][`rare1`]["itemNums"] }} +
              {{ EventData["ticket"][`rare1`]["itemGroups"] }}B <br />
              星3素材ドロップ率：
              {{ EventData["ticket"][`rare2`]["itemNums"] }} +
              {{ EventData["ticket"][`rare2`]["itemGroups"] }}B <br />
              <br />
              チケットドロップ確率：{{ EventData["dropTicketsRate"] }} <br />
              <br />
              <v-row class="pa-0 mb-n3 mt-n4">
                <v-col md="12">
                  <div>
                    <v-menu offset-y nudge-left="250">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          outlined
                          color="light-blue darken-2"
                          v-bind="attrs"
                          v-on="on"
                        >
                          イベント選択
                        </v-btn>
                      </template>
                      <v-list
                        class="overflow-y-auto"
                        dense
                        style="right: 200px"
                        max-height="calc(100vh - 24px)"
                        :style="themeColor"
                      >
                        <v-list-item
                          v-for="(event, index) in db.Events.filter(
                            (event) =>
                              -1 !==
                              event.parts.findIndex((x) => x === '超強敵')
                          ).reverse()"
                          :key="index"
                          @click="
                            () => {
                              opeateDB(returnThis).setEventsData(
                                event.m_EventType
                              );
                            }
                          "
                        >
                          <v-list-item-title>{{
                            event.m_EventName
                          }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </v-col>
              </v-row>
              <br />
              <v-btn outlined color="light-blue darken-2" @click="resetDB">
                データベース再読み込み
              </v-btn>
            </span>
            <span v-else>データ読み込み中です</span>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-btn
        class=""
        @click="
          () => {
            if (isLoaded) {
              this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
              if (isSupportIndexedDB)
                IndexedDB.setItem('darkmode', this.$vuetify.theme.dark);
            }
          }
        "
        icon
      >
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :style="themeColor">
      <div v-if="isLoading" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          class="ma-3"
        ></v-progress-circular>
        <br />読み込み中…
      </div>

      <div v-if="isDownloading" class="text-center">
        <v-progress-circular
          rotate="-90"
          :value="progressCircular"
          color="primary"
          class="ma-3"
        ></v-progress-circular>
        <br />{{ progressStr }}
      </div>

      <div v-if="isLoaded">
        <CalcPanel
          :EventData="EventData"
          :settings="settings"
          @expPerStm1="expPerStm1 = $event;"
        />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import CalcPanel from "./components/CalcDoEventTime";

const IndexedDB = (() => {
  let temp = require("./plugins/IndexedDB_module.js").indexeddb;
  return new temp();
})();

export default {
  name: "App",

  components: {
    CalcPanel,
  },

  data: () => ({
    test: "black",

    db: {},
    settings: {
      darkmode: true,
    },
    EventData: {
      dropTicketsRate: -1,
      Name: undefined,
    },
    isSupportIndexedDB: true,

    isLoading: true,
    isDownloading: false,
    downloadStatus: {
      downloaded: 0,
      max: 0,
    },
    isLoaded: false,

    dbNameList: ["Events", /*"ItemList", "NamedList",*/ "QuestList"],

    IndexedDB: IndexedDB,

    data_maybeOld_err: false,

    questTypeList: ["stamina", "ticket"],
    itemTypeList: ["rare1", "rare2"],
    dropChanceTypeList: ["itemNums", "itemGroups"],

    expPerStm1:()=>{},

    // latestEventName: undefined,
  }),

  methods: {
    // switchDarkMode: function() {
    //   this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    // },
    async resetDB() {
      if (this.isSupportIndexedDB) {
        let prom = [];
        for (const i of this.dbNameList) {
          prom.push(IndexedDB.removeItem(i));
        }
        await Promise.all(prom);
        this.$window.location.reload();
      }
    },

    

    // IndexedDB(){
    //   return IndexedDB;
    // },

    opeateDB(t = undefined) {
      return {
        getLatestEvents(db) {
          for (let i = db.length - 1; i >= 0; i--) {
            if (this.whereQuest(db[i], "極") !== -1) {
              return db[i];
            }
          }
        },
        whereQuest(quest, str) {
          return quest["parts"].findIndex((questType) => questType === str);
        },

        downloadDB() {
          return new Promise((resolve) => {
            t.isLoading = false;
            t.isDownloading = true;
            t.downloadStatus.max = t.dbNameList.length;
            t.downloadStatus.downloaded = 0;
            Promise.all(
              (() => {
                let output = [];
                for (let i = 0; i < t.dbNameList.length; i++) {
                  output.push(
                    this.getXHRresponce(
                      `https://database.kirafan.cn/database/${
                        t.dbNameList[i]
                      }.json?${Number(new Date())}`,
                      () => {
                        t.downloadStatus.downloaded++;
                      }
                    )
                  );
                }
                return output;
              })()
            )
              .then((value) => {
                for (let i = 0; i < value.length; i++) {
                  t.db[t.dbNameList[i]] = value[i];
                  if (t.isSupportIndexedDB)
                    IndexedDB.setItem(t.dbNameList[i], value[i]);
                }
                resolve();
              })
              .catch(() => {
                alert(
                  "データベースのダウンロードエラー！ページを再読み込みしてもこのメッセージが出る場合は@y52enに問い合わせてください"
                );
              });
          });
        },

        getXHRresponce(...Input) {
          return new Promise((resolve) => {
            let fileURL = Input[0];
            let callback = Input[1] || undefined;
            let fileType = Input[2] || "json";

            let xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.onreadystatechange = function () {
              if (this.readyState === 4 && this.status === 200) {
                if (this.response) {
                  if (callback) callback(fileURL);
                  resolve(this.response);
                }
              }
            };

            xmlHttpRequest.open("GET", fileURL, true);
            // @ts-ignore
            xmlHttpRequest.responseType = fileType;
            xmlHttpRequest.send(null);
          });
        },

        setEventsData(eventID = -1) {
          // console.log(t);
          t.isLoading = false;
          t.isDownloading = false;

          let latestEvents;
          if (eventID === -1) {
            latestEvents = this.getLatestEvents(t.db.Events);
          } else {
            latestEvents = t.db.Events.find(
              (event) => event.m_EventType === eventID
            );
          }

          t.EventData["Name"] = latestEvents["m_EventName"];

          const latestEventsID = latestEvents["m_EventType"];
          const kiwami_index = this.whereQuest(latestEvents, "極");

          if (new Date(latestEvents["endTimes"][kiwami_index]) < new Date()) {
            t.data_maybeOld_err = true;
          }

          const ticketQuest_index = (() => {
            let tmp = t.db.QuestList.findIndex(
              (quest) => String(quest["questID"]) === `3${latestEventsID}97`
            );
            if (tmp !== -1) {
              return tmp;
            } else {
              return t.db.QuestList.findIndex(
                (quest) => String(quest["questID"]) === `3${latestEventsID}98`
              );
            }
          })();

          const staminaQuest_index = (() => {
            for (let i = 40; i >= 0; i--) {
              let tmp = t.db.QuestList.findIndex(
                (quest) => String(quest["questID"]) === `3${latestEventsID}${i}`
              );
              if (tmp !== -1) {
                return tmp;
              }
            }
            alert(
              "エラー！\n@y52enに'スタミナクエストのIDパースエラーだと伝えてください"
            );
            return -1;
          })();

          // t.EventData.
          for (let q = 0; q < t.questTypeList.length; q++) {
            t.EventData[t.questTypeList[q]] = {}; //obj Init

            for (let i = 0; i < t.itemTypeList.length; i++) {
              t.EventData[t.questTypeList[q]][t.itemTypeList[i]] = {}; //obj Init

              for (let d = 0; d < t.dropChanceTypeList.length; d++) {
                t.EventData[t.questTypeList[q]][t.itemTypeList[i]][
                  t.dropChanceTypeList[d]
                ] = {}; //obj Init

                const QuestIndex = (() => {
                  if (t.questTypeList[q] === "stamina") {
                    return staminaQuest_index;
                  } else {
                    return ticketQuest_index;
                  }
                })();

                let itemIDIndex = t.db.QuestList[QuestIndex]["itemIDs"];

                let itemTypeIndex = (() => {
                  if (t.itemTypeList[i] === "rare1") {
                    return itemIDIndex.findIndex(
                      (item) => String(item) === `${latestEventsID}00`
                    );
                  } else {
                    return itemIDIndex.findIndex(
                      (item) => String(item) === `${latestEventsID}01`
                    );
                  }
                })();

                t.EventData[t.questTypeList[q]][t.itemTypeList[i]][
                  t.dropChanceTypeList[d]
                ] = (() => {
                  return t.db.QuestList[QuestIndex][t.dropChanceTypeList[d]][
                    itemTypeIndex
                  ];
                })();

                if (q === 0 && i === 0 && d === 0) {
                  const itemTypeIndex_ticket = itemIDIndex.findIndex(
                    (item) => String(item) === `${latestEventsID}03`
                  );
                  t.EventData["dropTicketsRate"] =
                    t.db.QuestList[QuestIndex]["itemNums"][
                      itemTypeIndex_ticket
                    ];
                }
              }
            }
          }
          t.isLoaded = true;
        },
      };
    },
  },

  computed: {
    progressCircular() {
      const dl_status = this.downloadStatus;
      return (dl_status.downloaded / dl_status.max) * 100;
    },
    progressStr() {
      const dl_status = this.downloadStatus;
      return `${dl_status.downloaded} / ${dl_status.max}`;
    },
    returnThis() {
      return this;
    },
    themeColor() {
      if (this.$vuetify.theme.dark) {
        return {
          background: "#222222",
          color: "#EEEEEE!important",
          "border-color": "#EEEEEE",
        };
      } else {
        return {
          background: "",
          color: "",
        };
      }
    },
  },

  mounted: async function () {
    await IndexedDB.init().catch((e) => {
      console.log(e);
      this.isSupportIndexedDB = false;
    });

    if (this.isSupportIndexedDB) {
      IndexedDB.setItem("db_version", 1);

      let darkmode = await IndexedDB.getItem("darkmode");
      if (typeof darkmode === "boolean") {
        this.$vuetify.theme.dark = darkmode;
      } else {
        IndexedDB.setItem("darkmode", false);
      }

      let dbEvents = await IndexedDB.getItem(this.dbNameList[0]);

      if (dbEvents) {
        let latestEvents = this.opeateDB(this).getLatestEvents(dbEvents);
        let kiwami_index = this.opeateDB(this).whereQuest(latestEvents, "極");

        if (new Date(latestEvents["endTimes"][kiwami_index]) >= new Date()) {
          this.db["Events"] = dbEvents;
          for (let i = 1; i < this.dbNameList.length; i++) {
            this.db[this.dbNameList[i]] = await IndexedDB.getItem(
              this.dbNameList[i]
            );
          }
          this.opeateDB(this).setEventsData();
        } else {
          await this.opeateDB(this).downloadDB();
          this.opeateDB(this).setEventsData();
        }
      } else {
        await this.opeateDB(this).downloadDB();
        this.opeateDB(this).setEventsData();
      }
    } else {
      await this.opeateDB(this).downloadDB();
      this.opeateDB(this).setEventsData();
    }
    // this.opeateDB(this).setEventsData(1011);

    // console.log(this.db);
    this.isLoaded = true;
  },
};
</script>
