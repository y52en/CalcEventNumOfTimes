"use strict";
class indexeddb {
  constructor(storageName = "indexedDB", indexName = "index") {
    this.storageName = storageName;
    this.indexName = indexName;

    this.keyPath = "KeyName";

    this.__db;
  }

  init() {
    return new Promise((resolve, reject) => {
      let request_db = indexedDB.open(this.storageName);

      request_db.onblocked = (event) => reject(["onblocked", event]);
      request_db.onerror = (event) => reject(["onerror", event]);

      request_db.onupgradeneeded = (event) => this.__createObjStore(event);

      request_db.onsuccess = (event) => {
        // @ts-ignore
        this.__db = event.target.result;
        resolve(["onsuccess", event]);
      };
    });
  }

  //KeyName,value or [[KeyName,value],[KeyName,value]...]
  setItem(...Input) {
    return new Promise((resolve, reject) => {
      let Item;

      if (Array.isArray(Input[0])) {
        Item = Input[0];
      } else {
        let KeyName = Input[0];
        let value = Input[1];
        Item = [[KeyName, value]];
      }

      let remainSetItem = Item.length;

      let objectStore = this.__getObjStore("readwrite");

      for (let i = 0; i < Item.length; i++) {
        let KeyName = Item[i][0];
        let value = Item[i][1];

        let objectStoreRequest = objectStore.put({
          [this.keyPath]: KeyName,
          value: value,
        });

        objectStoreRequest.onsuccess = () => {
          remainSetItem--;
          if (remainSetItem === 0) {
            resolve();
          }
        };

        objectStoreRequest.onerror = (event) => reject(["onerror", event]);
      }
    });
  }

  //KeyName or [KeyName1,KeyName2,KeyName3,...]
  getItem(...KeyName) {
    return new Promise((resolve) => {
      let KeyNameArray;

      const isInputArray = () => Array.isArray(KeyName[0]);
      if (isInputArray()) {
        KeyNameArray = KeyName[0];
      } else {
        let inputKeyName = KeyName[0];
        KeyNameArray = [inputKeyName];
      }

      let objectStore = this.__getObjStore("readonly");

      let remainGotItem = KeyNameArray.length;
      let output = new Array(KeyNameArray.length);

      for (let i = 0; i < KeyNameArray.length; i++) {
        let Req_getData = objectStore.get(KeyNameArray[i]);

        Req_getData.onsuccess = () => {
          if (Req_getData.result) {
            output[i] = Req_getData.result.value;
          } else {
            output[i] = undefined;
          }

          remainGotItem--;
          if (remainGotItem === 0) {
            isInputArray() ? resolve(output) : resolve(output[0]);
          }
        };
      }
    });
  }

  removeItem(KeyName) {
    return new Promise((resolve, reject) => {
      var objectStoreRequest = this.__getObjStore("readwrite").delete(KeyName);

      objectStoreRequest.onsuccess = (event) => resolve(["onsuccess", event]);
      objectStoreRequest.onerror = (event) => reject(["onerror", event]);
    });
  }

  clear() {
    return new Promise((resolve, reject) => {
      this.__db.close();
      let DBDeleteRequest = indexedDB.deleteDatabase(this.storageName);

      DBDeleteRequest.onsuccess = (event) => resolve(["onsuccess", event]);
      DBDeleteRequest.onerror = (event) => reject(["onerror", event]);
    });
  }

  // https://qiita.com/sienori/items/9c58a0c82159e483c3a4
  getItemForwardMatch(str) {
    return new Promise((resolve, reject) => {
      let nextStr;
      if (typeof str === "string") {
        nextStr =
          str.slice(0, -1) +
          String.fromCharCode(str.slice(-1).charCodeAt() + 1);
      } else {
        reject('The only "type" that can be inputted is "String".');
      }

      const range = IDBKeyRange.bound(str, nextStr, false, true);
      const objectStore = this.__getObjStore("readonly");

      let output = [];
      let reqOpenCursor = objectStore.openCursor(range);
      reqOpenCursor.onsuccess = (event) => {
        let cursor = event.target.result;
        if (cursor) {
          output.push(cursor.value);
          cursor.continue();
        } else {
          resolve(output);
        }
      };
      reqOpenCursor.onerror = (event) => reject(event);
    });
  }

  getAllItem() {
    return new Promise((resolve, reject) => {
      const objectStore = this.__getObjStore("readonly");

      let reqGetAllKeys = objectStore.getAll();

      reqGetAllKeys.onsuccess = (event) => resolve(event.target.result);
      reqGetAllKeys.onerror = (event) => reject(["onerror"], event);
    });
  }

  __getObjStore(transOption) {
    return this.__db
      .transaction([this.indexName], transOption)
      .objectStore(this.indexName);
  }

  __createObjStore(event) {
    event.target.result.createObjectStore(this.indexName, {
      keyPath: this.keyPath,
    });
  }
}

export const IndexedDB = new indexeddb();