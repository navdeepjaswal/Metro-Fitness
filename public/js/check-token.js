var token = localStorage.getItem('token')
var completedMeasurements = localStorage.getItem('completedMeasurements')
var url = ""

if (location.hostname === "localhost") {
    url = "http://localhost:3001/"
}

if(token && completedMeasurements === 'true') {
    window.location.href = url + "/dashboard.html"
} else if (token && completedMeasurements === 'false') {
    window.location.href = url + "/onboarding.html"
}