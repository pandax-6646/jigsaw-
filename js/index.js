class Game {
  constructor(tr, td) {
    this.tr = tr;
    this.td = td;
    this.oImgArea = $('.imgArea');

    // 是否可以开始游戏
    this.play = true;

    // 标准列表序列数组
    this.origArr = [];

    // 乱序列表序列数组
    this.randArr = [];

    // 小图片的宽和高的对象
    this.cellHW;

    // 小图片的元素数组
    this.oImgCellArr;

    this.firstTime;

    this.currTime;
  }

  // 得到每个小图片的宽高
  getCellWH() {
    return {
      H: parseInt(this.oImgArea.css('height')) / this.tr,
      W: parseInt(this.oImgArea.css('width')) / this.td
    }
  }

  

  // 初始化
  init() {
    
    randerGameTime();

    this.cellHW = this.getCellWH();
    let count = 0;

    this.oImgArea.text('');

    // 生成棋盘
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {

        // 创建元素
        let cell = $('<div class="imgCell"></div>');

        // 根据行与列的关系生成棋盘，并移动每个子元素上背景图片的位置
        $(cell).css({
          'width': this.cellHW.W + 'px',
          'height': this.cellHW.H + 'px',
          'left': this.cellHW.W * j,
          'top': this.cellHW.H * i,
          'backgroundPosition': (-this.cellHW.W) * j + 'px ' + (-this.cellHW.H) * i + 'px',
        });

        // 将当前的这个子元素插入到页面中
        this.oImgArea.append(cell);

        // 保存当前子元素在父级上的索引
        this.origArr.push(count);
        this.randArr.push(count);
        count++
      }
    }

    // 调用开始游戏方法
    this.startGame();
  }

  // 生成随机数
  randomNum() {

    this.randArr.sort(function () {
      return Math.random() - 0.5;
    })

    // 如果检测到数组没有被打乱就再次调用打乱数组方法，但要限定数组长度较短时才去检测，数组较长检测会有调用栈溢出情况
    if (this.randArr.toString() == this.origArr.toString() && this.tr == 2) {
      this.randomNum();
    }
  }

  // 开始游戏
  startGame() {

    this.oImgCellArr = $('.imgCell');
    let That = this;

    // 给点击按钮绑定click事件
    $('.start').on('click', () => {

      // 点击按钮的切换效果
      if (this.play) {

        this.randomNum()

        $('.start').text('复原').css('backgroundColor', '#0ff');
        this.play = false;

        // 以乱序数组来渲染子元素的位置
        this.cellRander(this.randArr);

        // 给每个子元素绑定事件
        this.oImgCellArr.on('mousedown', function (e) {

          // 获取当前点击到的元素在父级里的索引
          let indexDown = $(this).index();

          // 获取鼠标点击的位置到父级元素左顶点位置的距离（x, y）
          let leftDown = e.pageX - That.oImgCellArr.eq(indexDown).offset().left;
          let topDown = e.pageY - That.oImgCellArr.eq(indexDown).offset().top;


          $(document).on('mousemove', function (event) {
            That.oImgCellArr.eq(indexDown).css({
              'z-index': '40',

              // 获取鼠标这一时刻的位置相较于上一时刻的位置的变化量
              'left': event.pageX - leftDown - That.oImgArea.offset().left + 'px',
              'top': event.pageY - topDown - That.oImgArea.offset().top + 'px'
            })
          }).on('mouseup', function (event) {

            // 保存鼠标松开时该拖拽子元素的位置
            let topUp = event.pageY - That.oImgArea.offset().top;
            let leftUp = event.pageX - That.oImgArea.offset().left;

            // 获取拖拽运动的元素在鼠标抬起时，该位置上元素的在乱序数组里的索引
            let indexUp = That.getIndexUp(leftUp, topUp, indexDown);

            if (indexUp == indexDown) {

              // 鼠标越界，子元素回弹
              That.cellMove(That.randArr, indexDown, indexDown);

            } else {

              // 以修改乱序数组里的索引来达到让元素替换位置的效果
              That.cellsPositionChange(indexDown, indexUp);
            }

            $(document).off('mousemove').off('mouseup');
          })
        })
      } else {
        $('.start').text('打乱').css('backgroundColor', '#f0f');

        this.cellRander(this.origArr);
        this.play = true;

        $(this.oImgCellArr).off('mousemove').off('mouseup').off('mousedown');
      }
    })
  }

  // 子元素运动函数
  cellMove(arr, to, from) {
    this.oImgArea.find('.imgCell').eq(to).animate({
      'top': (this.cellHW.H) * (arr[from] - (arr[from] % this.td)) / this.td + 'px',
      'left': (this.cellHW.W) * (arr[from] % this.td) + 'px'
    }, 600, function () {

      // 修改层级
      $(this).css('z-index', '10')
    })
  }


  // 渲染子元素
  cellRander(arr) {
    for (let i = 0; i < this.origArr.length; i++) {

      this.cellMove(arr, i, i)
    }
  }


  // 获取当前鼠标抬起时的位置下的元素的索引
  getIndexUp(x, y, index) {

    if (x < 0 || x > (this.td * this.cellHW.W) || y < 0 || y > (this.tr * this.cellHW.H)) {
      return index;

    } else {

      // 行 = 鼠标当前相对于父级元素（oImgArea）左顶点为原点的坐标y值 / 子元素的高度
      let row = Math.floor(y / this.cellHW.H);

      // 列 同上
      let col = Math.floor(x / this.cellHW.W);

      // 求出该元素在标准数组里的索引（可理解为：一行子元素的个数 * 行数 + 最后一行的子元素的个数）
      let l = row * this.td + col;

      // 根据该元素在标准数组里的索引求出在乱序数组里索引
      let i = 0;
      let len = this.randArr.length;
      while ((i < len) && this.randArr[i] !== l) {
        i++;
      }
      return i;
    }
  }

  // 子元素位置交换
  cellsPositionChange(from, to) {

    let temp = this.randArr[from];

    this.cellMove(this.randArr, from, to)
    this.cellMove(this.randArr, to, from)

    // 交换乱序数组里的值
    this.randArr[from] = this.randArr[to];
    this.randArr[to] = temp;

    this.chack();

  }

  // 检测所有子元素是否能拼成一张完整图片 
  chack() {
    if (this.randArr.toString() == this.origArr.toString()) {

      // 延迟执行，使得图片运动完成后再触发
      setTimeout(() => {
        
        alert('恭喜你！拼图成功！！请进入下一关');
        
        // 清空数组，防止干扰
        this.origArr = [];
        this.randArr = [];

        // 以增加行与列的方式来增加游戏难度
        this.tr += 1;
        this.td += 1;

        let game = new Game(this.tr, this.td);
        game.init();

        $('.start').text('打乱').css('backgroundColor', '#f0f');
      
      }, 1000)
    }
  }
}

// 修改参数可以更改游戏难度
let game = new Game(2, 2);
game.init();