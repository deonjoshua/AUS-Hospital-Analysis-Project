const url = "api/hospitals";
let myChart;
let barChart;

d3.json(url).then(function (response) {
    console.log(response)

//ALL CODE FOLLOWIONG IS RELATED TO THE DROPDOWN MENUS SPCIFICALLY BUILT FOR PLOTLY/CHART.JS //
    let drop = ["All","ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"]
    let hosp = ["All"]
    let wait = ["5hr","4hr","3hr","2hr","1hr"]
    let total = [200000,175000,150000,125000,100000,75000,50000,25000, 10000]

    let dropdownMenu = d3.select("#selDataset");
    drop.forEach((name) =>
    dropdownMenu.append("option").text(name).property("value", name)
    );

    let dropdownhosp = d3.select("#selHospital");
    hosp.forEach((name) => {
    dropdownhosp.append("option").text(name).property("value", name);
    });

    let dropdownwait = d3.select("#selWait");
    wait.forEach((name) => {
    dropdownwait.append("option").text(name).property("value", name);
    });

    let dropdowntotal = d3.select("#selTotal");
    total.forEach((name) => {
    dropdowntotal.append("option").text(name).property("value", name);
    });
      
    let datasetDropdown = d3.select("#selDataset");
    let hospitalDropdown = d3.select("#selHospital");
    let waitDropdown = d3.select("#selWait")
    let totalDropdown = d3.select("#selTotal")


    let selDataset = datasetDropdown.property("value");
    let selHospital = hospitalDropdown.property("value");
    let selWait = waitDropdown.property("value");
    let selTotal = totalDropdown.property("value");

    updateVisuals(selDataset, selHospital, selWait, selTotal);
    
    // add an event listener to the dataset dropdown
    datasetDropdown.on("change", updateHospitalDropdown);
    waitDropdown.on("change", updateHospitalDropdown);
    totalDropdown.on("change", updateHospitalDropdown);
    hospitalDropdown.on("change", optionChanged);
    waitDropdown.on("change", optionChanged);
    totalDropdown.on("change", optionChanged);
    

    // function to update the hospital dropdown
    function updateHospitalDropdown() {
      // get the selected value from the dataset dropdown
      let selectedValue = datasetDropdown.property("value");
      const selectedWait = waitDropdown.property("value");
      const selectedTotal = totalDropdown.property("value");
      
      let totalfilter =  response.filter((row) => row.ED_waiting.No_of_Patients <= selectedTotal)
      let waitfilter = totalfilter.filter((row) => row.ED_waiting.Median_time_in_ED <= selectedWait.replace("hr","")) 
      // filter the data based on the selected value
      let filteredData = waitfilter
      if(selectedValue !== "All") {
      filteredData = waitfilter.filter((row) => row.State === selectedValue);
      }
      let waitData = waitfilter.filter((row) => row.State === selectedValue);
      // get an array of unique hospital names from the filtered data
      let hospNames = Array.from(new Set(waitData.map((row) => row.Hospital_Name)));
      
      // add 'All' to the beginning of the hospNames array
      hospNames.unshift('All');

      // remove existing options from the hospital dropdown
      hospitalDropdown.selectAll("option").remove();
    
      // add new options to the hospital dropdown
      hospNames.forEach((name) => {
        hospitalDropdown.append("option").text(name).property("value", name);
      });

      let selDataset1 = datasetDropdown.property("value");
      let selHospital1 = hospitalDropdown.property("value");
      let selWait1 = waitDropdown.property("value");
      let selTotal1 = totalDropdown.property("value");
      updateVisuals(selDataset1, selHospital1, selWait1, selTotal1);
    }    
      
    // function to handle changes in the hospital dropdown
    function optionChanged() {
      const selectedDataset = datasetDropdown.property("value");
      const selectedHospital = hospitalDropdown.property("value");
      const selectedWait = waitDropdown.property("value");
      const selectedTotal = totalDropdown.property("value");
    
      // Update the selected values of the dropdown menus
      datasetDropdown.property("value", selectedDataset);
      hospitalDropdown.property("value", selectedHospital);
      waitDropdown.property("value", selectedWait);
      totalDropdown.property("value", selectedTotal);
    
      // update the visuals based on the selected values
      updateVisuals(selectedDataset, selectedHospital, selectedWait, selectedTotal);
    }
    
    // function to update the visuals based on the selected values
    function updateVisuals(dataset, hospital, wait, total) {
      let selectedWait = d3.select("#selWait").property("value");
      let selectedTotal = d3.select("#selTotal").property("value");
      let selectedState = d3.select("#selDataset").property("value");
      let selectedHospital = d3.select("#selHospital").property("value");

      let totalfilter =  response.filter((row) => row.ED_waiting.No_of_Patients <= selectedTotal)
      let waitfilter = totalfilter.filter((row) => row.ED_waiting.Median_time_in_ED <= selectedWait.replace("hr","")) 

      console.log(waitfilter)

      let stateData = waitfilter

      if(selectedState !== "All") {
        stateData = waitfilter.filter((row) => row.State === selectedState);
        } else {
          stateData = waitfilter
        }

      let visualData = stateData
      let totalpatients = []
      let totallate = []
      let totalseen = []
      let typeofcare = []

      if(selectedHospital === "All") {
        let totals = {
          "Emergency": {
            "totalPatients": 0,
            "totalSeen": 0,
            "totalLate": 0
          },
          "Urgent": {
            "totalPatients": 0,
            "totalSeen": 0,
            "totalLate": 0
          },
          "Semi Urgent": {
            "totalPatients": 0,
            "totalSeen": 0,
            "totalLate": 0
          },
          "Non Urgent": {
            "totalPatients": 0,
            "totalSeen": 0,
            "totalLate": 0
          },
          "Resuscitation": {
            "totalPatients": 0,
            "totalSeen": 0,
            "totalLate": 0
          }
        };
        
        stateData.forEach(hospital => {
          if (hospital.Emergency) {
            let emergency = hospital.Emergency;
            totals["Emergency"].totalPatients += emergency.No_of_Patients;
            totals["Emergency"].totalSeen += (parseFloat(emergency.seen_on_time.replace("%", ""))/100)*(emergency.No_of_Patients);
          }
          if (hospital.Urgent) {
            let urgent = hospital.Urgent;
            totals["Urgent"].totalPatients += urgent.No_of_Patients;
            totals["Urgent"].totalSeen += (parseFloat(urgent.seen_on_time.replace("%", ""))/100)*(urgent.No_of_Patients);
          }
          if (hospital["Semi Urgent"]) {
            let semiUrgent = hospital["Semi Urgent"];
            totals["Semi Urgent"].totalPatients += semiUrgent.No_of_Patients;
            totals["Semi Urgent"].totalSeen += (parseFloat(semiUrgent.seen_on_time.replace("%", ""))/100)*(semiUrgent.No_of_Patients);
          }
          if (hospital["Non Urgent"]) {
            let nonUrgent = hospital["Non Urgent"];
            totals["Non Urgent"].totalPatients += nonUrgent.No_of_Patients;
            totals["Non Urgent"].totalSeen += (parseFloat(nonUrgent.seen_on_time.replace("%", ""))/100)*(nonUrgent.No_of_Patients);
          }
          if (hospital.Resuscitation) {
            let resuscitation = hospital.Resuscitation;
            totals["Resuscitation"].totalPatients += resuscitation.No_of_Patients;
            totals["Resuscitation"].totalSeen += (parseFloat(resuscitation.seen_on_time.replace("%", ""))/100)*(resuscitation.No_of_Patients);
          }
        });
        
        Object.keys(totals).forEach(key => {
          let totalLate = totals[key].totalPatients - totals[key].totalSeen;
          totals[key].totalLate = isNaN(totalLate) ? 0 : totalLate;
        });

        values = [totals.Emergency.totalPatients,totals["Semi Urgent"].totalPatients,totals.Urgent.totalPatients,totals["Non Urgent"].totalPatients,totals.Resuscitation.totalPatients]
        values2 = [totals.Emergency.totalSeen,totals["Semi Urgent"].totalSeen,totals.Urgent.totalSeen,totals["Non Urgent"].totalSeen,totals.Resuscitation.totalSeen]
        type = ["Emergency", "Semi Urgent", "Urgent", "Non Urgent", "Resuscitation"]

        //Create Pie Chart
      let canvas = document.getElementById('myChart').getContext('2d');
      if (myChart) {
        // If chart already exists, update data
        myChart.data.labels = type;
        myChart.data.datasets[0].data = values;
        myChart.update();
         } else {
        // If chart does not exist, create new chart
        myChart = new Chart(canvas, {
            type: "pie",
            data: {
                labels: type,
                datasets: [{
                    data: values
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Peer Groups"
                }
            }
        });
      }

      let bartotalpatients = 0
      for (let i = 0; i < values.length; i++) {
        bartotalpatients += values[i];
      }
      let bartotalseen = 0
      for (let i = 0; i < values2.length; i++) {
        bartotalseen += values2[i];
      }
      
      // Create the bar chart
      let canvas2 = document.getElementById('barchart').getContext('2d');
      console.log(bartotalseen)
      if (barChart) {
        // If chart already exists, destroy it before updating data
        barChart.data.datasets[0].data[0] = bartotalpatients;
        barChart.data.datasets[0].data[1] = bartotalseen;
        barChart.update();
      } else {
      
        barChart = new Chart(canvas2, {
          type: 'bar',        
          data: {
            labels: ['Total ED Patents', 'Total ED Patents Seen On Time'],
            datasets: [
              {
                label: 'Total Patiens vs Patients Seen on Time',
                backgroundColor: ['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)'],
                borderWidth: 1,
                data: [bartotalpatients, bartotalseen]
              },              
            ]
          },
          options: {
            title: {
              display: true,
              text: 'TEST'
          },
            legend: {
               display: false
            }},
        });
      }        
      


      //Create Bubble Chart
      let x2 = stateData.map((row)=> row.Hospital_ID);
      let y2 = stateData.map((row)=> row.ED_waiting.Median_time_in_ED);
      let z2 = stateData.map((row)=> row.ED_waiting.No_of_Patients);
      let hText2 = stateData.map((row)=> row.Hospital_Name);
              
          
      //Assign relevent data of the selected item to the bubble chart  
      let trace5 = [{
        x: x2,
        y: y2,
        hovertemplate: '<b>%{text} <br>- Median Wait Time: %{y} hours <br>- Total Patients: %{customdata} </b><extra></extra>',
        text: hText2,
        customdata: z2,
        mode: "markers",
        marker: {
          color: y2,
          size: z2,
          sizeref: 90,
          sizemode: 'area'      
          }
        }]; 

      //layout for the bubble chart
      let layout5 = {
        showlegend: false,
        xaxis: {
          title: 'Hospital ID',
          automargin: true
        },
        yaxis: {
          title: 'Median Wait Time (Hrs)'
        },
        margin: {
          t:2
        }
      };

      //Update the bubble chart
      Plotly.newPlot("bubble", trace5, layout5);
      
      } else {    
     
      visualData = stateData.filter((item)=> item.Hospital_Name === selectedHospital)
       
      if (visualData[0].Emergency) {
        let emergency = visualData[0].Emergency;
        totalpatients.push(emergency.No_of_Patients);
        totalseen.push((parseFloat(emergency.seen_on_time.replace("%", ""))/100)*(emergency.No_of_Patients));
        totallate.push(totalpatients-totalseen)
        typeofcare.push("Emergency");
      } else {
        totalpatients.push(0);
        totalseen.push(0);
        totallate.push(0);
        typeofcare.push("Emergency");
      }
            
      if (visualData[0].Urgent) {
        let urgent = visualData[0].Urgent;
        totalpatients.push(urgent.No_of_Patients);
        totalseen.push((parseFloat(urgent.seen_on_time.replace("%", ""))/100)*(urgent.No_of_Patients));
        totallate.push(totalpatients-totalseen)
        typeofcare.push("Urgent");
      } else {
        totalpatients.push(0);
        totalseen.push(0);
        totallate.push(0);
        typeofcare.push("Urgent");
      }
            
      if (visualData[0]["Semi Urgent"]) {
        let semiUrgent = visualData[0]["Semi Urgent"];
        totalpatients.push(semiUrgent.No_of_Patients);
        totalseen.push((parseFloat(semiUrgent.seen_on_time.replace("%", ""))/100)*(semiUrgent.No_of_Patients));
        totallate.push(totalpatients-totalseen)
        typeofcare.push("Semi Urgent");
      } else {
        totalpatients.push(0);
        totalseen.push(0);
        totallate.push(0);
        typeofcare.push("Semi Urgent");
      }      
      
      if (visualData[0]["Non Urgent"]) {
        let nonUrgent = visualData[0]["Non Urgent"];
        totalpatients.push(nonUrgent.No_of_Patients);
        totalseen.push((parseFloat(nonUrgent.seen_on_time.replace("%", ""))/100)*(nonUrgent.No_of_Patients));
        totallate.push(totalpatients-totalseen)
        typeofcare.push("Non Urgent");
      } else {
        totalpatients.push(0);
        totalseen.push(0);
        totallate.push(0);
        typeofcare.push("Non Urgent");
      }
            
      if (visualData[0].Resuscitation) {
        let resuscitation = visualData[0].Resuscitation;
        totalpatients.push(resuscitation.No_of_Patients);
        totalseen.push((parseFloat(resuscitation.seen_on_time.replace("%", ""))/100)*(resuscitation.No_of_Patients));
        totallate.push(totalpatients-totalseen)
        typeofcare.push("Resuscitation");
      } else {
        totalpatients.push(0);
        totalseen.push(0);
        totallate.push(0);
        typeofcare.push("Resuscitation");
      }
      

      //Create Pie Chart
      let canvas = document.getElementById('myChart').getContext('2d');
      if (myChart) {
        // If chart already exists, update data
        myChart.data.labels = typeofcare;
        myChart.data.datasets[0].data = totalpatients;
        myChart.update();
    } else {
        // If chart does not exist, create new chart
        myChart = new Chart(canvas, {
            type: "pie",
            data: {
                labels: typeofcare,
                datasets: [{
                    data: totalpatients
                }]
            },
            options: {
                title: {
                    display: true,
                    text: "Peer Groups"
                }
            }
        });
    }


    let bartotalpatients2 = 0
      for (let i = 0; i < totalpatients.length; i++) {
        bartotalpatients2 += totalpatients[i];
      }
      let bartotalseen2 = 0
      for (let i = 0; i < totalseen.length; i++) {
        bartotalseen2 += totalseen[i];
      }

      // Create the chart
      let canvas2 = document.getElementById('barchart').getContext('2d');
      console.log(totalpatients, totalseen)
      if (barChart) {
        // If chart already exists, destroy it before updating data
        barChart.data.datasets[0].data[0] = bartotalpatients2;
        barChart.data.datasets[0].data[1] = bartotalseen2;
        barChart.update()
      } else {
        //
        barChart = new Chart(canvas2, {
          type: 'bar',
          data: {
            labels: ['Total ED Patents', 'Total ED Patents Seen On Time'],
            datasets: [
              {
                label: 'Total Patiens vs Patients Seen on Time',
                backgroundColor: ['rgba(255, 99, 132, 0.2)','rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)'],
                borderWidth: 1,
                data: [bartotalpatients2, bartotalseen2]
              },
              
            ],           
        },
        options: {
          title: {
            display: true,
            text: 'TEST'},
          legend: {
            display: false
          },
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
      })
      }
      
    //Create Bubble Chart
    let x2 = stateData.map((row)=> row.Hospital_ID);
    let y2 = stateData.map((row)=> row.ED_waiting.Median_time_in_ED);
    let z2 = stateData.map((row)=> row.ED_waiting.No_of_Patients);
    let hText2 = stateData.map((row)=> row.Hospital_Name);
            
        
    //Assign relevent data of the selected item to the bubble chart  
    let trace5 = [{
      x: x2,
      y: y2,
      hovertemplate: '<b>%{text} <br>- Median Wait Time: %{y} hours <br>- Total Patients: %{customdata} </b><extra></extra>',
      text: hText2,
      customdata: z2,
      mode: "markers",
      marker: {
        color: y2,
        size: z2,
        sizeref: 90,
        sizemode: 'area'      
        }
      }]; 

    //layout for the bubble chart
    let layout5 = {
      showlegend: false,
      xaxis: {
        title: 'Hospital ID',
        automargin: true
      },
      yaxis: {
        title: 'Median Wait Time (Hrs)'
      },
      margin: {
        t:2
      }
    };

    //Update the bubble chart
    Plotly.newPlot("bubble", trace5, layout5);
      }     
};

})

let layers = {
    NSW: new L.LayerGroup(),
    VIC: new L.LayerGroup(),
    QLD: new L.LayerGroup(),
    SA: new L.LayerGroup(),
    TAS: new L.LayerGroup(),
    NT: new L.LayerGroup(),
    ACT: new L.LayerGroup(),
    WA: new L.LayerGroup()
  };

var map = L.map('map', {center: [-24.8501, 133.2455], zoom: 5, layers: [layers.NSW, layers.VIC, layers.QLD, layers.SA, layers.TAS, layers.NT, layers.ACT, layers.WA]});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let overlays = {
    "NSW": layers.NSW,
    "VIC": layers.VIC,
    "QLD": layers.QLD,
    "SA": layers.SA,
    "TAS": layers.TAS,
    "NT": layers.NT,
    "ACT": layers.ACT,
    "WA": layers.WA
  };

L.control.layers(null, overlays).addTo(map);

d3.json(url).then(function(data) {
    let state;
    for (let i = 0; i < data.length; i++) {
        if (data[i]['State']==='NSW'){
            state='NSW';
        }
        else if (data[i]['State']==='VIC'){
            state='VIC';
        }
        else if (data[i]['State']==='QLD'){
            state='QLD';
        }
        else if (data[i]['State']==='SA'){
            state='SA';
        }
        else if (data[i]['State']==='TAS'){
            state='TAS';
        }
        else if (data[i]['State']==='NT'){
            state='NT';
        }
        else if (data[i]['State']==='ACT'){
            state='ACT';
        }
        else {
            state='WA';
        }

        let newMarker = L.marker([data[i]['Latitude'], data[i]['Longitude']]);

        newMarker.addTo(layers[state]);

        newMarker.bindPopup(data[i]['Hospital_Name'] + "<br>" + data[i]['State'] + "<br> Peer Group: " + data[i]['Peer_group_name'] + "<br> No. of Patients(2021): " + data[i]['ED_waiting']['No_of_Patients'] + "<br> Median time in ED(Hrs): " + data[i]['ED_waiting']['Median_time_in_ED']);
    }

});

