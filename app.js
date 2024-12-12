// container.innerText="???"; // defer 테스트

// project
// 1. 로그인 유저를 먼저 불러오기 (상품 리스트, 공휴일 데이터)
// 2. 그 유저와 관련된 데이터 불러오기(장바구니, 스케줄)

const loadData=async function(){
    // let res=await fetch("./loginUser.json");
    // let user=await res.json();
    // let res2=await fetch("./products.json");
    // let products=await res2.json();
    // console.log(user, products);

    let resArr=await Promise.all([
        fetch("./loginUser.json"),
        fetch("./products.json")
    ]);
    // [res, res]=>[res.json(), res.json()]
    // [res,res].map((res)=>res.json()) => [res.json(),res.json()]
    let objArr=await Promise.all(resArr.map((res)=>res.json()));
        // resArr[0].json(),
        // resArr[1].json
    // console.log(objArr);

    const loginUser=objArr[0];
    const products=objArr[1];
    // baskets?user_id=jhs; -> jhsBaskets.json
    // 장바구니 데이터 로드
    let res3=await fetch(`./${loginUser["user_id"]}Baskets.json`);
    let baskets=await res3.json();
    console.log(baskets);
}
loadData();

///////////////////////////////////////////////////////////////////

moveSelectedList.onclick=(e)=>{
    if(selectedList.classList.contains("resize")){
        selectedList.classList.remove("resize");
        moveSelectedList.innerText="접기";
    }else{
        selectedList.classList.add("resize");
        moveSelectedList.innerText="펴기";
    }
}

const basketCont=document.querySelector("#basketCont");
const totalPriceB=document.querySelector("#totalPriceB");
const loadBasketsBtn=document.querySelector("#loadBasketsBtn");
const basketEx=document.querySelector("#basketEx");
let basketsObj={};
class BasketsObj{
    setBasket(basket){        
        if(this[basket.num]){
            alert("장바구니에 이미 존재함")
        }else{
            this[basket.num]=basket;
            this.total+=basket.total;
        }
    }
    delBasket(num){
        if(this[num]){
            this.total-=this[num].total;
            delete this[num];
        }else{
            alert("이미 삭제된 상품");
        }
    }
}
function Basket(form){
    this.num=Number(form.num.value);
    this.price=Number(form.price.value);
    this.cnt=Number(form.cnt.value);
    this.title=form.title.value;
    this.total=this.cnt*this.price;
}
const submitHandeler=function(e){
    e.preventDefault();
    let basket=new Basket(this);
    basketsObj.setBasket(basket);
    printBasketsObj();
}
const printBasketsObj=()=>{
    basketCont.innerHTML=""
        for(let num in basketsObj){
            if(isNaN(num)) continue; 
            let basket=basketsObj[num];
            let tr=basketEx.cloneNode(true);
            tr.removeAttribute("id");
            for(let key in basket){ 
                let td=tr.querySelector("." + key);
                td.append(document.createTextNode(basket[key]));
            }
            let delBtn=tr.querySelector(".delBtn");
            delBtn.dataset.num=basket.num;    
            delBtn.onclick=(e)=>{
                let delNum=e.target.dataset.num;
                basketsObj.delBasket(delNum);
                printBasketsObj();
            } 
            basketCont.append(tr);
        }
        totalPriceB.innerText = basketsObj["total"];
}
const loadBasketsFunc=()=>{
    const req= new XMLHttpRequest();
    req.open("GET", "./jhsBaskets.json");
    req.send();
    req.onload=()=>{
        if(req.status !== 200){ 
            alert("요청 실패, 다시 시도");
            return;
        }
        basketsObj=JSON.parse(req.responseText);
        Object.setPrototypeOf(basketsObj, BasketsObj.prototype);
        for (let num in basketsObj) { 
            if(isNaN(num)) continue;
            let basket = basketsObj[num];
            delete basketsObj[num];
            num = Number(num);
            basketsObj[num] = basket;
        }
        printBasketsObj();
    }
}
loadBasketsBtn.onclick=loadBasketsFunc;

const loadProductsBtn=document.getElementById(" loadProductsBtn");
const productList=document.getElementById("productList");
const productEx=document.getElementById("productEx");

const loadProducts=()=>{
    const req=new XMLHttpRequest();
    req.open("GET", "./products.json");
    req.send();
    req.onload=()=>{
        if(req.status !== 200){
            alert("데이터 불러오기 실패, 다시 시도");
            return;
        }
        let products=JSON.parse(req.responseText);
        products.forEach((p)=>{
            let ex=productEx.cloneNode(true);
            ex.removeAttribute("id");
            for(let key in p){
                let node=ex.querySelector("." + key);
                let form=ex.querySelector(".basketForm");
                if(key === "img[src]"){
                    node.src=p[key];
                }else{
                    node?.append(document.createTextNode(p[key]));
                    form[key].value=p[key];
                }
                form.onsubmit=submitHandeler;
            }
            productList.append(ex);
        });
    }
}
loadProductsBtn.onclick = loadProducts;
document.addEventListener("DOMContentLoaded", ()=>{
    loadProducts();
    loadBasketsFunc();
});