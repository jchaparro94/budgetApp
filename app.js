// The Budget Controller and UI Controller do not communicate at all. This is serparation of concerns. Each part should only be concerned about their own things. They are stand alone. We than create the third module, controller, which takes the info from both the budget and UI controller.

// BUDGET CONTROLLER
let budgetController = (function () {
   
   let Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   let Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   let data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      }
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
      inputBtn: '.add_btn'
   }

   return {
      getInput: function () {
         return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: document.querySelector(DOMstrings.inputValue).value

         };
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
   };


// 1.We set up the event listener for the input button here because this is the central place where we control what happens with each event
// 2. Create the To Do list for the actions that need to be done when the submit button is clicked 
// 3. Create the event listener for the keypress event. WE can concole log the 'event' to see what the keycodes are for each individual key. event.keycode || event.which 
// 4. We create a function that will do the "to do list" actions so that we dont repeat code. (In the function we can console.log "it works" so we can confirm the button and key press events work)
   
   let ctrlAddItem = function () {
      let input, newItem;
      // To Do list
      // 1. Get the filed input data
      input = UICtrl.getInput();

      // 2. Add the item to the budget Controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the item to the UI

      // 4. calculate the budget

      // 5. Display the budget on the UI
   };

   return {
      init: function () {
         console.log('App has started.');
         setUpEventListeners();
      }
   }
   
   
})(budgetController, UIController);

//App will not start unless we call the init function which contains our event listeners
controller.init();