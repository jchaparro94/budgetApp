// The Budget Controller and UI Controller do not communicate at all. This is serparation of concerns. Each part should only be concerned about their own things. They are stand alone. We than create the third module, controller, which takes the info from both the budget and UI controller.

// BUDGET CONTROLLER
let budgetController = (function () {
   
   let Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
   };

   Expense.prototype.calcPercentage = function (totalIncome) {
     
      if (totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
         this.percentage = -1;
      }
   };

   Expense.prototype.getPercentage = function () {
      return this.percentage;
   };

   let Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   let calculateTotal = function (type) {
      let sum = 0;

      data.allItems[type].forEach(function (cur) {
         sum = sum + cur.value;
      });
      data.totals[type] = sum;
   };

   let data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   };

   return {
      addItem: function (type, des, val) {
         let newItem;

         //Create new ID
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else {
            ID = 0;
         }

         //Create new item based on 'inc' or 'exp' type
         if (type === 'exp') {
            newItem = new Expense(ID, des, val);
         } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
         }
         //Push it into our data structure
         data.allItems[type].push(newItem);

         //Return the new element
         return newItem;
      },

      deleteItem: function (type, id) {
         let ids, index;
         ids = data.allItems[type].map(function (current) {
            return current.id;
         });

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }
      },

      calculateBudget: function () {
        
         // Calculate the total income and expensesContainer
         calculateTotal('exp');
         calculateTotal('inc');

         // Calculate the budget: income - expensesContainer
         data.budget = data.totals.inc - data.totals.exp;

         // Calculate the percentage of income that we spent
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = -1;
         }

      },

      calculatePercentages: function () {
         data.allItems.exp.forEach(function (cur) {
            cur.calcPercentage(data.totals.inc);
         });
      },

      getPercentages: function () {
         let allPerc = data.allItems.exp.map(function (cur) {
            return cur.getPercentage();
         });
         return allPerc;
      },

      getBudget: function () {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         }
      },

      // This is just for testing in the console, will be deleted before production
      testing: function () {
         console.log(data);
      }
   };


})();



// UI CONTROLLER
let UIController = (function () {

   let DOMstrings = {
      inputType: '.add_type',
      inputDescription: '.add_description',
      inputValue: '.add_value',
      inputBtn: '.add_btn',
      incomeContainer: '.income_list',
      expensesContainer: '.expenses_list',
      budgetLabel: '.budget_value',
      incomeLabel: '.budget_income_value',
      expensesLabel: '.budget_expenses_value',
      percentageLabel: '.budget_expenses_percentage',
      container: '.container',
      expensesPercLabel: '.item_percentage',
      dateLabel: '.budget_title_month'

   };

   let formatNumber = function (num, type) {
      let numSplit, int, dec;

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');

      int = numSplit[0];
      if (int.length > 3) {
         int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input is 2310, output will be 2,320
      }

      dec = numSplit[1];

      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
   };

   let nodeListForEach = function (list, callback) {
      for (let i = 0; i < list.length; i++) {
         callback(list[i], i);
      } 
   };

   return {
      getInput: function () {
         return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //Parsefloat converts this string into a number. We need the value to be set as a number for calculations to be done.

         };
      },

      addListItem: function (obj, type) {
         let html, newHtml, element;
         // Create HTML string with placeholder text

         if (type === 'inc') {
            element = DOMstrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-window-close"></i></button></div></div></div>';
         } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;

            html = '<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete_btn"><i class="far fa-window-close"></i></button></div></div></div>';
         }

         // Replace the placeholder text with some actual data
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

         // Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },

      deleteListItem: function (selectorID) {
         let el = document.getElementById(selectorID);
         el.parentNode.removeChild(el);
      },
      // Clear the input fields after the user inserts an income or expense
      clearFields: function () {
         let fields, fieldsArr;

         fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

         fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(function (current, index, array) {
            current.value = "";
         });

         fieldsArr[0].focus();
      },

      displayBudget: function (obj) {

         obj.budget > 0 ? type = 'inc' : type = 'exp';
         
         document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
         document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
         document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
         
         if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';

         }

      },

      displayPercentages: function (percentages) {

         let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

         nodeListForEach(fields, function (current, index) {

            if (percentages[index] > 0) {
               current.textContent = percentages[index] + '%';
            } else {
               current.textContent = '---';
            }
         });

      },

      displayDate: function () {
         let now, year, month;
         now = new Date();
         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
         month = now.getMonth();
         year = now.getFullYear();
         // let christmas = new Date(2019, 11, 25);
         document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      },

      changedType: function () {
        
         let fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ',' +
            DOMstrings.inputValue
         );

         nodeListForEach(fields, function (cur) {
            cur.classList.toggle('red-focus');
         });

         document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
      },

      getDOMstrings: function () {
         return DOMstrings;
      }
   };

   
})();










// GLOBAL APP CONTROLLER
// 1. budgetCtrl IS budgetcontroller, we simply call it something different for best practice. If we ever had to change anything with the budgetcontroller, we would simply need to 
let controller = (function (budgetCtrl, UICtrl) {

   let setUpEventListeners = function () {
      let DOM = UICtrl.getDOMstrings();
      // Event listener for when the button is clicked....after we do step 4 and create the function, we can pass it through the second argument.
      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
      //Event listener for when the return key is pressed
      document.addEventListener('keypress', function (event) {
         if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
         }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
   };


// 1.We set up the event listener for the input button here because this is the central place where we control what happens with each event
// 2. Create the To Do list for the actions that need to be done when the submit button is clicked 
// 3. Create the event listener for the keypress event. WE can concole log the 'event' to see what the keycodes are for each individual key. event.keycode || event.which 
// 4. We create a function that will do the "to do list" actions so that we dont repeat code. (In the function we can console.log "it works" so we can confirm the button and key press events work)
   
   let updateBudget = function () {
      let budget;
      // 1. Calculate the budget
      budgetCtrl.calculateBudget();

      // 2. Return the budget
      budget = budgetCtrl.getBudget();
      // 3. Display the budget on the UI
      UICtrl.displayBudget(budget);
   };

   let updatePercentages = function () {
      // 1. Calculate the updatePercentages
      budgetCtrl.calculatePercentages();
      // 2. Read them from the budget controller
      let percentages = budgetCtrl.getPercentages();
      // 3. Update the UI with the new Percentages
      UICtrl.displayPercentages(percentages);
   };


   let ctrlAddItem = function () {
      let input, newItem;
      // To Do list
      // 1. Get the filed input data
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
         // 2. Add the item to the budget Controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);
   
         // 3. Add the item to the UI
         UICtrl.addListItem(newItem, input.type);
   
         // 4. Clear the fields
         UICtrl.clearFields();
   
         // 5. Calculate and Update budget
         updateBudget();

         //6. Calculate and update the Percentages
         updatePercentages();
      }

   };

   let ctrlDeleteItem = function (event) {
      let itemID, splitID, type, ID;

      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
         splitID = itemID.split('-');
         type = splitID[0];
         ID = parseInt(splitID[1]);

         // 1. Delete Item from the data structure
         budgetCtrl.deleteItem(type, ID);

         // 2. Delete the item from the UIController
         UICtrl.deleteListItem(itemID);

         // 3. Update and show the new budget
         updateBudget();

         //6. Calculate and update the Percentages
         updatePercentages();

      }

   };

   return {
      init: function () {
         console.log('App has started.');
         UICtrl.displayDate();
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
         });
         setUpEventListeners();
      }
   }
   
   
})(budgetController, UIController);

//App will not start unless we call the init function which contains our event listeners
controller.init();