import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

export default createStore({
  state: {
    data: [],
    timestamps: [],
    legende: [],
  },
  mutations: {
    loadData: (state, csvData) => {
      let data = parse(csvData);
      let legende = data.shift();
      let timestamps = [];
      let dataArray = [];

      // Get Timestamps
      let timestampLocation = -1;
      for(let i = 0; i < legende.length; i++){
        if(legende[i].toLowerCase() == "timestamp"){
          legende.splice(i, 1);
          timestampLocation = i;
          break;
        }
      }
      if(timestampLocation >= 0){
        data.forEach(row => {
          timestamps.push(row[timestampLocation]);
          row.splice(timestampLocation, 1);
        });
      
        // Get dimensions in own arrays
        for(let row = 0; row < data.length; row++){
          for(let column = 0; column < data[row].length; column++){
            if(dataArray[column] === undefined){
              dataArray[column] = [];
            }
            dataArray[column].push([timestamps[row], data[row][column]]);
          }
        }
        state.data = dataArray;
        state.timestamps = timestamps;
        state.legende = legende;
      }
    }
  },
  actions: {

  },
  modules: {

  }
})
