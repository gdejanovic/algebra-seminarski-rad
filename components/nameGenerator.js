
export default function nameGenerator () {

    const nameURL = 'https://api.namefake.com/';
    fetch(nameURL)
        .then(response => response.json())
        .then(data => {
          var name = [data.username]; 
          localStorage.setItem('username',name)
        } )
           
       
}

