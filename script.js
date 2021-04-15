let body = document.querySelector("body");
let addsign = document.createElement('button');

let signatureHolder = null;
let ctx = null;
let signing = false;

let signedContent = null;
let inc = false, dec = false;

let download = false;
let pdfCtx = null;

function clearBody() 
{
    body.innerHTML = null;
    body.innerHTML = `<div class="sign-modal-holder"></div>`;
}

function clearCanvas()
{
    ctx.clearRect(0, 0, signatureHolder.width, signatureHolder.height);
}


function addSignature()
{
    let sourceImageData = document.querySelector('#signature-holder').toDataURL("image/png");
    let destinationImage = new Image();
    destinationImage.onload = function(){
        signedContent.setAttribute('src',destinationImage.src);
        download = !download;
        closeModal();

        let add = document.querySelector('#add');
        add.textContent = 'Download pdf';

        let signedContentDiv = document.querySelector('#signed-content-div');
        signedContentDiv.style.display = "inline-block";

        let pdfHolder = document.querySelector('.pdf-holder');
        pdfHolder.addEventListener("click",() => {
            let Helperbuttons = document.querySelectorAll("#signed-content-div button");
            if(Helperbuttons.length > 0)
            {
                signedContentDiv.style.border = "none";
                Helperbuttons.forEach(button => {
                    button.style.display = "none";
                })
            }
        });

        signedContentDiv.addEventListener("click",() => {
            let Helperbuttons = document.querySelectorAll("#signed-content-div button");
            signedContentDiv.style.border = "1px solid #000";
            Helperbuttons.forEach(button => {
                button.style.display = "block";
            })
        });
    };
    destinationImage.src = sourceImageData;
}

function openModal()
{
    if(download)
    {
        downloadpdf();
        return;
    }

    let signedContentDiv = document.querySelector('#signed-content-div');
    signedContentDiv.style.zIndex = "0";

    let signModalHolder = document.querySelector(".sign-modal-holder");
    signModalHolder.innerHTML = `
        <div class="sign-modal">
            <div class="heading-holder">
                <span class="heading"> Add your signature </span>
                <span style="align-self: flex-end; font-size: 15pt; border: 1px solid #000;padding: 3px 8px 3px 8px;" onclick="closeModal();"> x </span>
            </div>
            <div class="sign-sect-holder">
                <canvas id="signature-holder"></canvas>
                <span onclick="clearCanvas();" style="color: #000; margin: 10px;"> Clear </span>
            </div>
            <button type="button" class="btn btn-success" onclick="addSignature();");"> Add </button>
        </div>
    `;

    signatureHolder = document.querySelector('#signature-holder');
    signatureHolder.width  = window.innerWidth;
    signatureHolder.height = window.innerHeight;
    ctx = signatureHolder.getContext("2d");

    signatureHolder.addEventListener('mousedown',startPosition);
    signatureHolder.addEventListener('touchstart',startPosition);
    signatureHolder.addEventListener('mouseup',finishedPosition);
    signatureHolder.addEventListener('touchend',finishedPosition);
    signatureHolder.addEventListener('touchmove',dosign);
    signatureHolder.addEventListener('mousemove',dosign);

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    body.style.overflow = "hidden";

    setTimeout(() => {
        document.querySelector('.sign-modal-holder').style.transform = "scale(1)";
    }, 200);
}


function closeModal()
{
    let signModalHolder = document.querySelector(".sign-modal-holder");
    document.querySelector('.sign-modal-holder').style.transform = "scale(0)";

    setTimeout(() => {
        signModalHolder.innerHTML = null;
        body.style.overflow = "auto";
    }, 200);
}

function imageSizeIncrease()
{
    let signedContentDiv = document.querySelector('#signed-content-div');
    let image = document.querySelector('#signed-content-div img');

    if(!inc)
    {
        signedContentDiv.style.height = `${80 + 20}px`;
        signedContentDiv.style.width = `${180 + 20}px`;
        inc = true;
        dec= true;
    }
    else
    {
        let h = parseInt(signedContentDiv.style.height.replace('px',''));
        let w = parseInt(signedContentDiv.style.width.replace('px',''));

        if(h > 160 || w > 260)
            return;

        signedContentDiv.style.height = `${h + 20}px`;
        signedContentDiv.style.width = `${w + 20}px`;
    }
}

function imageSizeDecrease()
{
    let signedContentDiv = document.querySelector('#signed-content-div');
    let image = document.querySelector('#signed-content-div img');
    
    if(!dec)
    {
        signedContentDiv.style.height = `${80 - 20}px`;
        signedContentDiv.style.width = `${180 - 20}px`;
        dec = true;
    }
    else
    {
        let h = parseInt(signedContentDiv.style.height.replace('px',''));
        let w = parseInt(signedContentDiv.style.width.replace('px',''));

        if(h < 60 || w < 160)
            return;

        signedContentDiv.style.height = `${h - 20}px`;
        signedContentDiv.style.width = `${w - 20}px`;
    }
}

function delImage()
{
    let signedContentDiv = document.querySelector('#signed-content-div');
    signedContentDiv.style.display = "none";
    download = false;
    let add = document.querySelector('#add');
    add.textContent = "Add signature";
}


function downloadpdf()
{
    let Helperbuttons = document.querySelectorAll("#signed-content-div button");
    let signedContentDiv = document.querySelector("#signed-content-div");

    if(Helperbuttons.length > 0)
    {
        signedContentDiv.style.border = "none";
        Helperbuttons.forEach(button => {
            button.style.display = "none";
        });
    }

    var opt = {
        margin: 1,
        filename: 'signed_doc.pdf',
        image: {type: 'jpeg', quality: 2},
        html2canvas: {scale: 5},
        jsPdf: {unit: 'in', format: 'letter', orientation: 'portrait'}
    }

    html2pdf().set(opt).from(document.querySelector('.content-holder')).save().then(data => {
        console.log('Success',data);
    })
    .catch(err => {
        console.log('Error occured !',err);
    });
}


function signDOMRender()
{
    let signPageHolder = document.createElement('div');
    signPageHolder.setAttribute('class','sign-page-holder');
    signPageHolder.innerHTML = `
        <header>Sign your document</header>
        <div class="content-holder">
            <canvas class="pdf-holder"></canvas>
            <div id="signed-content-div">
                <div class="btn-holder">
                    <button class="btn btn-success" onclick="imageSizeIncrease();">+</button>
                    <button class="btn btn-danger" onclick="imageSizeDecrease();">-</button>
                </div>
                <button class="del-holder" onclick="delImage();"> 
                    <i class="fa fa-trash"> </i> 
                </button>
                <img class="signed-content"></img>
            </div>
        </div>
        <button id="add" class="btn btn-success" onclick="openModal();"> Add signature </button>
    `;
    return(signPageHolder);
}



function displayPdf(pdfFile)
{
    pdfjsLib.getDocument(pdfFile).promise.then(doc => {
        doc.getPage(1).then(page => {
            clearBody();
            body.appendChild(signDOMRender());

            signedContent = document.querySelector(".signed-content");

            $('#signed-content-div').draggable();

            let canvas = document.querySelector('.pdf-holder'); 
            pdfCtx =  canvas.getContext('2d');
            let viewport = page.getViewport(5);
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            page.render({
                canvasContext: pdfCtx,
                viewport: viewport
            })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
}



function startPosition(e) 
{
    signing = true;
    dosign(e);
}

function finishedPosition() 
{
    signing = false;
    ctx.beginPath();
}

function dosign(e)
{
    if(!signing)
        return;

    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    if(e.type.includes('touch'))
    {
        ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.touches[0].clientX, e.touches[0].clientY);
        return;
    }

    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
}




(() => {
    let drag = document.querySelector(".dragzone");
    let upload = document.querySelector("#upload");
    let inputFile = document.querySelector("#input-file");
    let events = ['dragenter','dragover','dragleave','drop'];

    inputFile.addEventListener("change",() => {
        let file = inputFile.files[0];

        if(file.size/1024/1024 > 12)  {
            alert('File size should be less than or equal to 12MB');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {displayPdf(reader.result)};
    });

    drag.addEventListener('dragover',() => {
        drag.style.border = '2px solid #000';
    });

    drag.addEventListener('dragleave',() => {
        drag.style.border = '2px dashed rgba(0,0,0,0.2)';
    });

    upload.addEventListener("click",() => inputFile.click());
    events.forEach(event => drag.addEventListener(event,(e) => e.preventDefault()));

    drag.addEventListener('drop',(e) => {
        let file = e.dataTransfer.files[0];
        if(file.size/1024/1024 > 12) {
            alert('File size should be less than or equal to 12MB');
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {displayPdf(reader.result)};
    })
})();