class Square{
    constructor(row, col){
        this.row = row;
        this.col = col;
        this.val = 0;

        this.domObj = document.createElement('div');
        this.domObj.classList.add('square');
        this.domObj.id = row + '_' + col;

        //debug
        this.domObj.title = this.domObj.id;
    }

    setVal(val){
        this.val = val;
    }

    setOnClick(onClickFn){
        this.domObj.onclick = onClickFn;
    }

    getVal(){
        return this.val;
    }

    getDomObj(){
        return this.domObj;
    }

    onHumanSelect(){
        this.val = 1;
        this.getDomObj().classList.add('orange');
    }

    onCpuSelect(){
        this.val = -1;
        this.getDomObj().classList.add('green');
    }

    isOccupied(){
        return this.val !== 0;
    }

    getSurrounding(){
        let y = this.row;
        let x = this.col;

        let list = [];
        list.push([y+1, x]);
        list.push([y-1, x]);
        list.push([y, x+1]);
        list.push([y, x-1]);
        list.push([y+1, x+1]);
        list.push([y-1, x+1]);
        list.push([y-1, x-1]);
        list.push([y+1, x-1]);

        return list.map(arr => new Square(arr[0], arr[1])).filter(s => s.isValid() && !s.isOccupied());
    }

    isValid(){
        return this.row < 20 && this.row > -1 && this.col < 20 && this.col > -1;
    }

    twinkle(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.getDomObj().classList.add('white');
                resolve(this);
            }, 5);
        });
    }

    untwinkle(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.getDomObj().classList.remove('white');
                resolve(this);
            }, 5);
        });
    }
}
