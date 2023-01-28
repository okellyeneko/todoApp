exports.getDate = function () {
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    }
    const today  = new Date();
    return today.toLocaleDateString("en-US", options)
}

exports.getDay = function () {
    const options = {
        weekday: "long",
        day: "numeric",
    }
    const today  = new Date();
    return today.toLocaleDateString("en-US", options)
    
}
