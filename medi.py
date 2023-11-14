import csv

def eval_number(x, ranges):
   for r in ranges:
      try:
         start, end = r.split('-')
      except ValueError:
         if r.startswith("more"):
            num = float(''.join(filter(str.isdigit, r)))
            if x >= num:
               return r
      start_num = float(''.join(filter(str.isdigit, start)))
      end_num = float(''.join(filter(str.isdigit, end)))
      
      if start_num <= x <= end_num:
         return r
   return '??'


csvfile = open('data.csv', 'r')
reader = csv.reader(csvfile)

headers = []

values = {}

for i,row in enumerate(reader):
   if i == 0:
       headers = row
       continue

   for j, col in enumerate(row):
         if j == 0:
             continue
         values[headers[j]] = [col] if not headers[j] in values else values[headers[j]] + [col] if not col in values[headers[j]] else values[headers[j]]


age = int(input("Enter age: "))
age_r = eval_number(age, values['AGE'])
gender = input("Enter gender: ")
weight = int(input("Enter weight: "))
weight_r = eval_number(weight, values['WEIGHT'])

for i,s in enumerate(values["SYMPTOMS"]):
   print(f'{i+1}. {s}')
s_i = input("Enter symptom (seperate by comma):").split(',')

symptoms = list(map(lambda x: values["SYMPTOMS"][int(x) - 1], s_i))

for i,d in enumerate(values["EXISTING MEDICAL CONDITION"]):
   print(f'{i+1}. {d if d != "" else "None"}')
d_i = int(input("Enter existing medical condition:"))
existing_medi_condition = values["EXISTING MEDICAL CONDITION"][d_i-1]

for i,f in enumerate(values["DURATION OF FEVER"]):
   print(f'{i+1}. {f}')
f_i = int(input("Enter duration of fever:"))
dur_of_fever = values["DURATION OF FEVER"][f_i-1]

t = eval_number(int(input('Enter temperature: ')), values["TEMPERATURE"])

csvfile = open('data.csv', 'r')
reader2 = csv.reader(csvfile)
pres = []
for i,row in enumerate(reader2):
    if row[1] == age_r and row[3] == weight_r and row[4] in symptoms and row[5] == dur_of_fever and row[6] == existing_medi_condition and row[7] == t:
       drug = row[8]
       dose = row[9]
       dose_interval = row[10]

       pres.append(f'You can have {dose} of {drug}, {dose_interval}')
# removeingasdnad duplpciationad 
pres  = list(dict.fromkeys(pres))
if pres:
   for i,p in enumerate(pres):
      print(p)
      if i == len(pres) - 1:
         print('Thank you for using our service.')
      else:
         print("OR")
else:
    print("Could not find a prescription, please consult a doctor.")
csvfile.close()