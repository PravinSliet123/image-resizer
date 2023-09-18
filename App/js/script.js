const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


function loadImage(e) {
    const file = e.target.files[0]
    if (!isFileImage(file)) {
       alertError('please selec an image')

        return;
    }

    // get original dimensions

    const image = new Image()
    image.src = URL.createObjectURL(file)
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height
    }

    form.style.display = 'block'
    filename.innerText = file.name
    outputPath.innerText = path.join(os.homedir(),'imageresizer')
}

// Send imagdata to main process

function sendImage(e){
    e.preventDefault();

    const width = widthInput.value
    const height = heightInput.value
    const imagPath = img.files[0]?.path

    if(!img.files[0])
    {
        alertError('Please uplaod an image');
        return ;
    }

    if(width === "" || height === ""){
        alertError("Please fill in a height and width");
        return ;

    }

    // send to main using ipc renderer
    ipcRenderer.send('image:resize',{
        imagPath,
        width,
        height 
    })


}


// chatch image image:done


ipcRenderer.on('image:done', ()=>{
    alertSuccess(`Image resized to successfully ${widthInput.value}X${heightInput.value}`)
})


// check the file is image

function isFileImage(file) {
    const acceptedImagType = ['image/gif', 'image/png', 'image/jpeg']

    return file && acceptedImagType.includes(file['type'])
}


function alertError(message){
Toastify.toast({
    text:message,
    duration:5000,
    close:false,
    style:{
        background:"red",
        color:"white",
        textAlign:"center",
        position:"absolute",
        width:"100%"
    }

})
}


function alertSuccess(message){
Toastify.toast({
    text:message,
    duration:5000,
    close:false,
    style:{
        background:"green",
        color:"white",
        textAlign:"center"
    }

})
}






img.addEventListener('change', loadImage)

form.addEventListener('submit', sendImage)