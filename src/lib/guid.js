
// Create globally unique ids for all objects to aid React rendering
const guid = (function () {
    var uid = 0;
    return () => uid += 1
})()

export default guid
