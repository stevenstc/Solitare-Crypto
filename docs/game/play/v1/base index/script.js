    //en mantenimiento hasta que se actualice la version web
    //location.href = location.origin +"/download";


    function alertOpen(){
    alert("you has open 2 or more windows, please close or baned");
        alertOpen();
    }
    // Check if the sessionStorage object exists
    function checkSesion(hacer){
    console.log("checsesion...")
    if(localStorage) {

        if(hacer){
        if(!localStorage.getItem("gameOpen")){
            localStorage.setItem("gameOpen", "1")
        }else{

            var data = parseInt(localStorage.getItem("gameOpen"))+1
            localStorage.setItem("gameOpen", data+"");

        }
        }

        if(parseInt(localStorage.getItem("gameOpen")) > 1){
            localStorage.setItem("gameOpen", "0")
            alertOpen();

        }

    }
    }

    //checkSesion();

    window.onload = (event) => {
    checkSesion(true);
    alert('sesion started: '+ localStorage.getItem("gameOpen"));
    setInterval(() => {checkSesion(false);}, 3*1000); 
    };

    window.unload = () => {
    ocalStorage.setItem("gameOpen", "0");
    }
    
    window.onbeforeunload = () => {

    localStorage.setItem("gameOpen", "0");
    return "clsesure???";

    }
  
