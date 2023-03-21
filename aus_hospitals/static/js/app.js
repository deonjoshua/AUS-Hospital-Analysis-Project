const url = "/api/hospitals";

d3.json(url).then(function (response) {
    console.log(response);
});
