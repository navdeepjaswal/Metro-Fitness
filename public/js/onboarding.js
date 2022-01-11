var token = localStorage.getItem('token')

if (token) {
    $.ajaxSetup({
        headers: {
            'Authorization': token
        }
    })
}

// Event Listeners
$('#nextBtn').click(function (e) { openSetYourGoals(e) })
$('#submitBtn').click(function (e) { updateUser(e) })

// Hiding/showing different parts of the flow
$('#goWithRecommendationBtn').click(function (e) { openRecommendation() })
$('#enterMyOwnBtn').click(function (e) { openCalorieIntake() })
$('#setYourGoalsBackBtn').click(function (e) { goToLetsGetStarted() })
$('#customIntakeBackBtn').click(function (e) { goToSetYourGoals() })
$('#whatIsYourGoalBackBtn').click(function (e) { goToSetYourGoals() })

function openSetYourGoals(e) {
    e.preventDefault()

    if (
        !$('#name').val() ||
        !$('#age').val() ||
        !$('#gender').val() ||
        !$('#weight').val() ||
        !$('#feet').val ||
        !$('#inches').val() ||
        !$('#activity').val()
    ) {
        alert('Please fill in all required fields.')
    } else {
        $('#letsGetStarted').addClass('d-none')
        $('#setYourGoals').removeClass('d-none')
    }
}

function openRecommendation() {
    $('#setYourGoals').addClass('d-none')
    $('#whatIsYourGoal').removeClass('d-none')
    $('#submitBtnContainer').removeClass('d-none')
}

function openCalorieIntake() {
    $('#calorieIntakeContainer').removeClass('d-none')
    $('#setYourGoals').addClass('d-none')
    $('#submitBtnContainer').removeClass('d-none')
}

function goToLetsGetStarted() {
    $('#setYourGoals').addClass('d-none')
    $('#whatIsYourGoal').addClass('d-none')
    $('#letsGetStarted').removeClass('d-none')
}

function goToSetYourGoals() {
    $('#calorieIntake').val('')
    $('#setYourGoals').removeClass('d-none')
    $('#calorieIntakeContainer').addClass('d-none')
    $('#whatIsYourGoal').addClass('d-none')
    $('#submitBtnContainer').addClass('d-none')
}

function updateUser(e) {
    e.preventDefault()
    let goal = $('input[name=goalSelected]:checked').val()
    let totalInches = parseInt($('#feet').val()) * 12 + parseInt($('#inches').val())
    let centimeters = totalInches * 2.54
    let requestBody = {
        name: $('#name').val(),
        age: $('#age').val(),
        gender: $('#gender').val(),
        weight: $('#weight').val(),
        height: centimeters,
        activity: $('#activity').val(),
        goal: goal
    }

    if ($('#calorieIntake').val()) {
        requestBody.userCalorieIntake = $('#calorieIntake').val()
    } else {
        requestBody.userCalorieIntake = null
    }

    $.post('http://localhost:3001/api/onboarding', requestBody)
        .then((data) => {
            localStorage.setItem('completedMeasurements', data.completedMeasurements)
            window.location.href = "http://localhost:3001/dashboard.html"
        })
        .catch((err) => {
            alert("There was a problem submitting your form")
            localStorage.setItem('completedMeasurements', 'false')
            console.log(err);
        })
}
