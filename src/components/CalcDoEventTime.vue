<template>
  <v-container>
    <!-- スタミナクエ 特効
    <v-text-field type="number"
        label="星2素材"
        class="pa-0 my-1"
        outlined
        v-model.number="dateDATA"
    ></v-text-field> -->
    <template>
      <span class="text-h6">アイテム所持数</span>
      <v-row class="pa-0 mt-n1 mb-n9">
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星2素材"
            outlined
            v-model.number="inputData.ownedItem.rare1"
          ></v-text-field>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星3素材"
            outlined
            v-model.number="inputData.ownedItem.rare2"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="pa-0 mb-n5">
        <v-col md="6">
          <v-text-field
            type="number"
            label="チケット"
            outlined
            v-model.number="inputData.ownedItem.ticket"
          ></v-text-field>
        </v-col>
      </v-row>
    </template>

    <template>
      <span class="text-h6">特効数</span>
      <v-row class="pa-0 ml-0" style="font-size: 14px"> スタミナ </v-row>
      <v-row class="pa-0 mb-n9">
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星2素材"
            outlined
            v-model.number="inputData.bonus.stamina.rare1"
          ></v-text-field>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星3素材"
            outlined
            v-model.number="inputData.bonus.stamina.rare2"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="pa-0 ml-0" style="font-size: 14px"> チケット </v-row>

      <v-row class="pa-0 mb-n9">
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星2素材"
            outlined
            v-model.number="inputData.bonus.ticket.rare1"
          ></v-text-field>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星3素材"
            outlined
            v-model.number="inputData.bonus.ticket.rare2"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row class="pa-0 mb-n7 mt-n4">
        <v-col md="12">
          <v-btn
            outlined
            color="light-blue darken-2"
            @click="staminaBonusToTickets"
          >
            チケットの特効をスタミナと同じにする
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="pa-0 my-n4">
        <v-col md="6">
          <v-checkbox
            label="チケットクエは周回しない"
            v-model.number="inputData.noPlayTicketQuest"
          ></v-checkbox>
        </v-col>
      </v-row>
    </template>

    <template>
      <span class="text-h6 mb-n10">必要個数</span>
      <v-row class="pa-0">
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星2素材"
            outlined
            v-model.number="inputData.Objective.rare1"
          ></v-text-field>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-text-field
            type="number"
            label="星3素材"
            outlined
            v-model.number="inputData.Objective.rare2"
          ></v-text-field>
        </v-col>
      </v-row>
    </template>

    <template>
      <v-row class="text-h6 mt-n8">
        <v-col>
          <span v-for="(i, index) of [1, 2]" :key="index">
            星{{ i + 1 }}素材回収完了までに <br />
            必要スタミナ: {{ necessaryTimeOrStm(i, "stamina") }}<br />
            必要周回数(スタミナ): {{ necessaryTimeOrStm(i, "TimeStamina") }}
            <br />
            必要周回数(チケット): {{ necessaryTimeOrStm(i, "TimeTickets") }}
            <br />
            <!-- <br />星3素材回収完了までに <br />
            必要スタミナ: {{ this.necessaryTimeOrStm(1, "TimeTickets") }}<br />
            必要周回数(スタミナ):
            {{ this.output_necessaryTimeToQuest_Stamina2 }}
            <br />
            必要周回数(チケット):
            {{ this.output_necessaryTimeToQuest_Tickets2 }} -->
            <br />
          </span>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style>
/* 
https://qiita.com/chimayu/items/58e3481305e91d188be3
*/
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>

<script>
export default {
  name: "CalcPanel",

  data: () => ({
    inputData: {
      noPlayTicketQuest: false,
      ownedItem: {
        rare1: undefined,
        rare2: undefined,
        ticket: undefined,
      },
      bonus: {
        ticket: {
          rare1: undefined,
          rare2: undefined,
        },
        stamina: {
          rare1: undefined,
          rare2: undefined,
        },
      },
      Objective: {
        rare1: undefined,
        rare2: undefined,
      },
    },
    gotExp: {
      goldKey: {
        stm: null,
        exp: 2400,
      },
      // stm5: {
      //   stm: 5,
      //   exp: 350,
      // },
      stm25: {
        stm: 25,
        exp: 2000,
      },
      ticket: {
        stm: null,
        exp: 3200,
      },
      archive: {
        stm: 25,
        exp: 4000,
      },
      halfFennel: {
        stm: 12,
        exp: 3740,
      },

      /**
       * 300
       *
       * 4000 * 12 = 48000
       * 3740 * 25 = 93500
       *
       * 2000 * 12 = 24000
       * 2000 * 12 + (12 * 0.15 * 3200) = 29760
       * 12 * s.gotItem_Per_Quest(2,"stamina") = 381
       * 381 / s.tradeRate.goldKey.rate = 19
       * 19 * 2400 = 45600
       *
       */
    },
    tradeRate: {
      goldKey: {
        rare: 2,
        rate: 20,
      },
    },
  }),

  props: {
    EventData: {
      type: Object,
    },
    settings: {
      type: Object,
    },
  },

  mounted() {
    this.$emit("expPerStm1", this.expPerStm1);
  },

  methods: {
    staminaBonusToTickets() {
      this.inputData.bonus.ticket.rare1 = this.inputData.bonus.stamina.rare1;
      this.inputData.bonus.ticket.rare2 = this.inputData.bonus.stamina.rare2;
    },

    gotItem_Per_Quest(rare, type) {
      const input = this.inputData;
      const EventData = this.EventData;
      const EventData_rare = EventData[type][`rare${rare}`];

      return (
        EventData_rare["itemNums"] +
        EventData_rare["itemGroups"] * (input.bonus[type][`rare${rare}`] || 0)
      );
    },

    necessaryTimeOrStm(rare, type) {
      const input = this.inputData;
      const EventData = this.EventData;
      const RequiredNumOfItem = this.NeedItem(rare);

      const gotItem_Per_StmQuest = this.gotItem_Per_Quest(rare, "stamina");
      const gotItem_Per_TicketsQuest = this.gotItem_Per_Quest(rare, "ticket");

      const NumOfPlayStmQuest = (() => {
        if (input.noPlayTicketQuest) {
          return Math.ceil(RequiredNumOfItem / gotItem_Per_StmQuest);
        } else {
          if (
            RequiredNumOfItem -
              (input.ownedItem.ticket || 0) * gotItem_Per_TicketsQuest <=
            0
          ) {
            return 0;
            // return Math.ceil(RequiredNumOfItem / gotItem_Per_TicketsQuest)
          } else {
            return Math.ceil(
              (RequiredNumOfItem -
                (input.ownedItem.ticket || 0) * gotItem_Per_TicketsQuest) /
                (gotItem_Per_StmQuest +
                  EventData["dropTicketsRate"] * gotItem_Per_TicketsQuest)
            );
          }
        }
      })();

      switch (type) {
        case "stamina":
          return NumOfPlayStmQuest < 0 ? 0 : NumOfPlayStmQuest * 25;
        case "TimeStamina":
          return NumOfPlayStmQuest < 0 ? 0 : NumOfPlayStmQuest;
        case "TimeTickets":
          return (() => {
            if (input.noPlayTicketQuest || NumOfPlayStmQuest < 0) {
              return "0 + 0";
            } else if (
              RequiredNumOfItem -
                (input.ownedItem.ticket || 0) * gotItem_Per_TicketsQuest <=
              0
            ) {
              return `0 + ${Math.ceil(
                RequiredNumOfItem / gotItem_Per_TicketsQuest
              )}`;
            } else {
              return `${cutOffDecimalNum(
                NumOfPlayStmQuest * EventData["dropTicketsRate"],
                2
              )} + ${input.ownedItem.ticket || 0}`;
            }
          })();
      }

      function cutOffDecimalNum(num, digits) {
        return Math.floor(num * (10 ^ digits)) / (10 ^ digits);
      }
    },

    /**
     * 300
     *
     * 4000 * 12 = 48000
     * 3740 * 25 = 93500
     *
     * 2000 * 12 = 24000
     * 2000 * 12 + (12 * 0.15 * 3200) = 29760
     * 12 * s.gotItem_Per_Quest(2,"stamina") = 381
     * 381 / s.tradeRate.goldKey.rate = 19
     * 19 * 2400 = 45600
     *
     */

    expPerStm1(type, countTickets) {
      const EventData = this.EventData;
      const gotExp = this.gotExp;
      const gotExp_type = gotExp[type];

      let output = 0;

      if (type === "event") {
        output += gotExp.stm25.exp / gotExp.stm25.stm;
        const gotItemPerStm1 =
          this.gotItem_Per_Quest(2, "stamina") / gotExp.stm25.stm;
        const getFromExp_FromGoldKey_byStm =
          (gotItemPerStm1 / this.tradeRate.goldKey.rate) * gotExp.goldKey.exp;

        output += getFromExp_FromGoldKey_byStm;
        if (countTickets) {
          //eslint-disable-next-line
          // debugger;
          const playTicketQuestTime = EventData.dropTicketsRate / gotExp.stm25.stm;
          const gotExpFromTicketsQuest =
            gotExp.ticket.exp * playTicketQuestTime;
          const gotItemPerTicket =
            this.gotItem_Per_Quest(2, "ticket") * playTicketQuestTime;
          const getFromExp_FromGoldKey_byTicket =
            (gotItemPerTicket / this.tradeRate.goldKey.rate) *
            gotExp.goldKey.exp;
            // console.log(gotExp.goldKey.exp);

          output += gotExpFromTicketsQuest + getFromExp_FromGoldKey_byTicket;
        }
      } else {
        output = gotExp_type.exp / gotExp_type.stm;
      }

      return output;
    },

    NeedItem(rare) {
      let NeedItem =
        (this.inputData.Objective[`rare${rare}`] || 0) -
        (this.inputData.ownedItem[`rare${rare}`] || 0);
      return NeedItem >= 0 ? NeedItem : 0;
    },
  },
};
</script>
