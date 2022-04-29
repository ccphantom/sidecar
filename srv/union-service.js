// const cds = require('@sap/cds')

module.exports = function(){
  // this.before("READ", `Unions`, (each) => {
  //   console.log(each.customerID);
  //   console.log(each.code);
  // });
  // this.after("READ", `Unions`, (each) => {
  //   console.log(each.customerID);
  //   console.log(each.code);
  // });
  // this.before('CREATE', `Unions`, (req)=>{
  //   let union = req.data
  // });
  // this.on("CREATE", `Unions`, (req) => {
  //   let union = req.data;
  // });
  // this.after("CREATE", `Unions`, (req) => {
  //   console.log('After Create');
  // });
  this.before('NEW', `Unions`, req => {
    req.data.validFrom = new Date();
  });
  // this.on("NEW", `Unions`, (req) => {
  //   console.log('On New')
  // });
  // this.after("NEW", `Unions`, (req) => {
  //   console.log('After New')
  // });
}
