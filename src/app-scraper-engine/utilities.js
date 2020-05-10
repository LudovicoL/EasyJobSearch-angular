module.exports = {

  sleep: async function sleep(s) {
    let ms = s*1000;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
