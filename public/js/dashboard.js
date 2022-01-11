/* globals Chart:false, feather:false */
var token = localStorage.getItem('token')
var userId = ''

if (token) {
  $.ajaxSetup({
    headers: {
      'Authorization': token
    }
  })
}

(function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  // Graphs
  var ctx = document.getElementById('myChart')
  var ptx = document.getElementById('pieChart')
  // eslint-disable-next-line no-unused-vars
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        data: [],
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#007bff',
        borderWidth: 4,
        pointBackgroundColor: '#007bff'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
            callback: function (value) {
              return value + ' lbs'
            }
          }
        }]
      },
      legend: {
        display: false
      }
    }
  })

  var macroChartConfig = {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'My First Dataset',
        data: [],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    },
  }
  var macroChart = new Chart(ptx, macroChartConfig)
  var today = new Date()
  var userData = {}

  getExerciseHistory(today).then(() => {
    getMeals(today).then(() => {
      updateCaloriesRemaining()
    })
  })

  getWeights()
  getFoodOptions()

  $.get('http://localhost:3001/api/auth/current_user')
    .then(user => {
      $('#downloadReportBtn').attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(user)))
      $('#downloadReportBtn').attr('download', 'report') 

      if (user.isAdmin) {
        $('#downloadReportBtn').removeClass('d-none')
      }

      $('#name').text(user.name)
      $('#calorieIntake').text(user.calorieIntake)
      userId = user.id
    })
    .catch(err => {
      console.log(err)
    })

  $('#submitExerciseBtn').click(() => {
    var caloriesBurnt = $('#caloriesBurntInput').val()

    // Logging exercise
    $.post('http://localhost:3001/api/activity/log', {
      userId: userId,
      burnt: caloriesBurnt
    })
      .then(data => {
        console.log(data)
        $('#exerciseModal').modal('hide')
        $('#caloriesBurntInput').val('')
        getExerciseHistory(today);
      })
      .catch(err => {
        console.log(err)
      })
  })

  $('#submitWeightBtn').click(() => {
    var weight = $('#weightInput').val()

    $.post('http://localhost:3001/api/weight/log', {
      weight
    })
      .then(weight => {
        console.log(weight)
        $('#weightModal').modal('hide')
        $('#weightInput').val('')
        addData(myChart, moment(weight.created_at).format('MM/DD'), weight.weight)
      })
      .catch(err => {
        console.log(err)
      })
  })

  $('#submitMealBtn').click(() => {
    var foundMeal = false;
    var mealSelected = $('#mealSelected').val()
    var options = $('#datalistOptions').children()
    var foodId = ''

    $.each(options, (key, option) => {
      if (mealSelected === $(option).text()) {
        foodId = $(option).attr('data-id')
        console.log(foodId)
        foundMeal = true
      }
    })

    if (foundMeal) {
      // Ajax Call
      $.post('http://localhost:3001/api/foods/log', { foodId })
        .then(data => {
          $('#mealPlannerModal').modal('hide')
          $('#mealSelected').val('')
          getMeals(new Date())
        })
        .catch(err => {
          console.log(err)
        })
    } else {
      alert("Meal not found. Please select a preset meal.")
    }
  })

  $('#mealDate').change(function (val) {
    const date = new Date($(this).val())
    $('#datepicker').datepicker('hide')
    getMeals(date)
  })

  function getExerciseHistory(date) {
    return new Promise((resolve, reject) => {
      $.get('http://localhost:3001/api/activity/' + date.toISOString())
        .then(exercises => {
          renderExerciseHistory(exercises)
          setCaloriesBurnt(exercises)
          resolve(exercises)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  function getMeals(date) {
    return new Promise((resolve, reject) => {
      $.get('http://localhost:3001/api/foods/meals/' + date.toISOString())
        .then(meals => {
          renderMeals(meals)
          setCaloriesConsumed(meals)
          createMacrosPieChart(meals)
          resolve(meals)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }

  function createMacrosPieChart(meals) {
    let totalProteins = 0
    let totalCarbs = 0
    let totalFats = 0

    $.each(meals, (key, meal) => {
      totalProteins += meal.protein
      totalCarbs += meal.carbs
      totalFats += meal.fats
    })

    // Removes Protein, Fats, Carbs
    removeData(macroChart)
    removeData(macroChart)
    removeData(macroChart)

    addData(macroChart, 'Proteins', Math.round(totalProteins))
    addData(macroChart, 'Carbs', Math.round(totalCarbs))
    addData(macroChart, 'Fats', Math.round(totalFats))
  }

  function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
  }

  function setCaloriesConsumed(meals) {
    let total = 0;

    $.each(meals, (key, meal) => {
      total += meal.calories
    })

    $('#caloriesConsumed').text(Math.round(total))
    updateCaloriesRemaining()
  }

  function setCaloriesBurnt(exercises) {
    let total = 0;

    $.each(exercises, (key, exercise) => {
      total += exercise.burnt
    })

    $('#caloriesBurnt').text(Math.round(total))
    updateCaloriesRemaining()
  }

  function updateCaloriesRemaining() {
    const calorieIntake = parseInt($('#calorieIntake').text())
    const caloriesConsumed = parseInt($('#caloriesConsumed').text())
    const caloriesBurnt = parseInt($('#caloriesBurnt').text())

    $('#caloriesRemaining').text(calorieIntake - caloriesConsumed + caloriesBurnt)
  }

  function renderExerciseHistory(exercises) {
    $('#exerciseHistoryTable').html('')
    $('#noExercisesFound').addClass('d-none')

    if (exercises.length) {
      exercises.forEach(exercise => {
        $('#exerciseTableContainer').removeClass('d-none')

        $('#exerciseHistoryTable').append(
          '<tr>' +
          '<td>' + moment(exercise.created_at).format('MM-DD-YYYY') + '</td>' +
          '<td>' + moment(exercise.created_at).format("hh:mm a") + '</td>' +
          '<td>' + exercise.burnt + '</td>' +
          '</tr>'
        );
      })
    } else {
      $('#exerciseTableContainer').addClass('d-none')
      $('#noExercisesFound').removeClass('d-none')
    }

  }

  //unhides no meals found text once meals are populated
  function renderMeals(meals) {
    $('#mealPlannerTable').html('')
    $('.noMealsFound').addClass('d-none')

    if (meals.length) {
      $('#mealPlannerTableContainer').removeClass('d-none')
      $('#pieChart').removeClass('d-none')

      meals.forEach(meal => {
        $('#mealPlannerTable').append(
          '<tr>' +
          '<td>' + moment(meal.created_at).format('MM-DD-YYYY') + '</td>' +
          '<td>' + meal.name + '</td>' +
          '<td>' + meal.protein + 'g </td>' +
          '<td>' + meal.carbs + 'g </td>' +
          '<td>' + meal.fats + 'g </td>' +
          '<td>' + Math.round(meal.calories) + '</td>' +
          '</tr>'
        );
      })
    } else {
      $('#mealPlannerTableContainer').addClass('d-none')
      $('.noMealsFound').removeClass('d-none')
      $('#pieChart').addClass('d-none')
    }
  }

  function getFoodOptions() {
    $.get('http://localhost:3001/api/foods/')
      .then(foods => {
        console.log(foods)
        renderFoodOptions(foods)
      })
      .catch(err => {
        console.log(err)
      })
  }
  //renders food options in the drop-down
  function renderFoodOptions(foods) {
    $('#datalistOptions').html('')

    foods.forEach(food => {
      $('#datalistOptions').append(
        `<option data-id="${food._id}">${food.name}</option>`
      );
    })
  }

  function getWeights() {
    myChart.reset()

    return new Promise((resolve, reject) => {
      $.get('http://localhost:3001/api/weight/')
        .then(weights => {
          console.log(weights)
          $.each(weights, (key, weight) => {
            addData(myChart, moment(weight.created_at).format('MM/DD'), weight.weight)
          })
          resolve(weights)
        })
        .catch(err => reject(err))
    })
  }

  function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
    });
    chart.update();
  }
})()