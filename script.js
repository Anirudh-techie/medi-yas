function CSVToArray(strData, strDelimiter) {
   // Check to see if the delimiter is defined. If not,
   // then default to comma.
   strDelimiter = (strDelimiter || ",");

   // Create a regular expression to parse the CSV values.
   var objPattern = new RegExp(
      (
         "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

         "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

         "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
   );

   var arrData = [[]];

   var arrMatches = null;
   while (arrMatches = objPattern.exec(strData)) {
      var strMatchedDelimiter = arrMatches[1];
      if (
         strMatchedDelimiter.length &&
         strMatchedDelimiter !== strDelimiter
      ) {
         arrData.push([]);
      }

      var strMatchedValue;
      if (arrMatches[2]) {
         strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"),
            "\""
         );

      } else {
         strMatchedValue = arrMatches[3];
      }
      arrData[arrData.length - 1].push(strMatchedValue);
   }

   return (arrData);
}
function evalNumber(x, ranges) {
   for (let r of ranges) {
      let start, end;
      [start, end] = r.split('-');
      if (r.startsWith("more")) {
         let num = parseFloat(r.replace(/\D/g, ''));
         if (x >= num) {
            return r;
         }
      }
      let startNum = parseFloat(start.replace(/\D/g, ''));
      let endNum = parseFloat(end.replace(/\D/g, ''));
      if (startNum <= x && x <= endNum) {
         return r;
      }
   }
   return '??';
}

fetch('data.csv')
   .then(response => response.text())
   .then(data => {
      let csv = CSVToArray(data);
      let headers = csv[0];
      let values = {};

      let symptomsCont = document.getElementById('symptoms-cont');
      let conditionsCont = document.getElementById('conditions-cont');
      let duration = document.getElementById('duration');

      for (let i = 1; i < csv.length; i++) {
         let cols = csv[i];

         for (let j = 0; j < cols.length; j++) {
            if (j == 0) {
               continue;
            }

            if (!values[headers[j]]) {
               values[headers[j]] = [];
            }
            if (!values[headers[j]].includes(cols[j])) {
               values[headers[j]].push(cols[j]);
            }
         }
      }

      for (let x of values["SYMPTOMS"]) {
         const checkbox = document.createElement('input');
         checkbox.type = 'checkbox';
         checkbox.className = 'symptoms';
         checkbox.value = x;
         checkbox.name = x.replace(/ /g, '');
         checkbox.id = x.replace(/ /g, '');
         const label = document.createElement('label');
         label.innerHTML = x + "<br>";
         label.htmlFor = x.replace(/ /g, '');

         symptomsCont.appendChild(checkbox);
         symptomsCont.appendChild(label);
      }
      for (let x of values["EXISTING MEDICAL CONDITION"]) {
         const checkbox = document.createElement('input');
         checkbox.type = 'checkbox';
         checkbox.className = 'conditions';
         checkbox.value = x;
         checkbox.name = x.replace(/ /g, '');
         checkbox.id = x.replace(/ /g, '');
         const label = document.createElement('label');
         label.innerHTML = (x || "None") + "<br>";
         label.htmlFor = x.replace(/ /g, '');

         conditionsCont.appendChild(checkbox);
         conditionsCont.appendChild(label);
      }

      for (let x of values["DURATION OF FEVER"]) {
         duration.innerHTML += `<option value="${x}">${x}</option>`
      }

      document.getElementById('medicalForm').addEventListener('submit', function (event) {
         event.preventDefault();

         let age = document.getElementById('age').value;
         let ageR = evalNumber(age, values['AGE']);
         let gender = document.getElementById('gender').value;
         let weight = document.getElementById('weight').value;
         let weightR = evalNumber(weight, values['WEIGHT']);
         let temp = evalNumber(document.getElementById('temp').value, values['TEMPERATURE']);

         let symptoms = Array.from(document.getElementsByClassName('symptoms')).filter(x => x.checked).map(x => x.value);
         let conditions = Array.from(document.getElementsByClassName('conditions')).filter(x => x.checked).map(x => x.value);

         let durationOfFever = duration.value;

         let pres = [];
         for (let i = 1; i < csv.length; i++) {
            let row = csv[i];
            if (row[1] == ageR && row[3] == weightR && symptoms.includes(row[4]) && row[5] == durationOfFever && conditions.includes(row[6]) && row[7] == temp) {
               let drug = row[8];
               let dose = row[9];
               let doseInterval = row[10];

               pres.push(`You can have ${dose} of ${drug}, ${doseInterval}`);
            }
         }

         // Remove duplicates
         pres = [...new Set(pres)];

         let output = document.getElementById('output');
         output.innerHTML = "";
         if (pres.length > 0) {
            for (let i = 0; i < pres.length; i++) {
               output.innerHTML += pres[i];
               if (i < pres.length - 1) {
                  output.innerHTML += "<br> OR <br>";
               } else {
                  output.innerHTML += '<br> Thank you for using our service.';
               }
            }
         } else {
            output.innerHTML = "Could not find a prescription, please consult a doctor.";
         }

         alert(output.innerHTML.replace(/<br>/g, '\n'));
      });
   })
   .catch(error => console.error('Error:', error));