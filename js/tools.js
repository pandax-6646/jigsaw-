// 获取当前游戏时间
let firstTime = new Date().getTime();
let randerGameTime = function  () {
  let currTime = new Date().getTime();

  let time = (currTime - firstTime) / 1000;
  let str, hours, minute, second;

  if (time > 3600) {
    let num = parseInt(parseInt(time / 3600));
    hours = num >= 10 ? num + ':' : '0' + num + ':';
    minute = (time - num * 3600) / 60 >= 10 ? parseInt((time - num * 3600) / 60) + ':' : '0' + parseInt((time - num * 3600) / 60) + ':';
  } else {
    hours = parseInt(time / 3600) > 0 ? (parseInt(time / 3600) >= 10 ? (parseInt(time / 3600) + ':') : ('0' + parseInt(time / 3600) + ':')) : '00:';
    minute = parseInt(time / 60) >= 10 ? (parseInt(time % 3600) >= 59 ? (parseInt(parseInt(time % 3600) / 60) + ':') : (parseInt(time / 60) + ':')) : ('0' + parseInt(time / 60) + ':');
  }

  second = parseInt(time % 60) >= 10 ? parseInt(time % 60) : '0' + parseInt(time % 60);

  // 更新上次保留的时间
  str = hours + minute + second;

  $('.time').find('span').text(str)

  requestAnimationFrame( randerGameTime );
}

