let product = {name: '', features: [], explanation: '', images_urls: []};
let products = [];
let imagesInput = [];
let imageFiles = [];
let temporaryFeatures = [];

const pathServer = "https://productshowcase-lhrz.onrender.com/"

onload = async function () {
    const res = await fetch(`${pathServer}products`);
    const data = await res.json();

    if (data.product.length !== 0) {
        for (let i=0; i<data.product.length; i++){
            const name = data.product[i].name;
            const explanation = data.product[i].explanation;
            const features = []
            const images_urls = []

            for (let _i=0; _i<data.product_feature.length; _i++){
                if (data.product_feature[_i].product_id === i+1){features.push(data.product_feature[_i].name);}
            }

            for (let _i=0; _i<data.product_image.length; _i++){
                if (data.product_image[_i].product_id === i+1){images_urls.push(data.product_image[_i].image_url);}
            }

            products.push({name: name, features: features, explanation: explanation, images_urls: images_urls});
        }
    };

    //if (localStorage.getItem("products")) {products=JSON.parse(localStorage.getItem("products"));}
}

function createImageIntroduction() {
    const imageInput = document.getElementById("imageInput");
    imageInput.addEventListener("change", function (){
        if (this.value.length === 0) {return;}
        const file = imageInput.files[0];
        //const reader = new FileReader
        
        //reader.readAsDataURL(file);

        //reader.onload = function() {
        //    const base64 = reader.result;
        //    createElementImage(base64, "imagesIntroduction");
        //    imagesInput.push(base64)
        //}
        
        const imageURL = URL.createObjectURL(file);
        createElementImage(imageURL, "imagesIntroduction");
        imagesInput.push(imageURL);
        imageFiles.push(file);
        this.value = ''; //this is imageInput
        }
    )
}

function createElementImage(src, parent) {
    const img = document.createElement("img");
    if (typeof(parent) === "string") {document.getElementById(parent).appendChild(img);}
    else {parent.appendChild(img)}
    img.src = src;
    img.style.maxWidth = "300px";
    img.style.maxHeight = "300px";
}

function createElementList(text, parent) {
    const li = document.createElement("li");
    if (typeof(parent) === "string") {document.getElementById(parent).appendChild(li);}
    else {parent.appendChild(li);}
    li.textContent = text;
    return li;
}

function addFeature() {
    const featuresInput = document.getElementById("featuresInput");
    if (featuresInput.value) {
        temporaryFeatures.push(featuresInput.value);
        const li = createElementList(featuresInput.value, "featuresIntroduction");
        li.addEventListener("click", function() {
            temporaryFeatures = temporaryFeatures.filter(item => item !== li.textContent);
             li.remove();
            })
    }
    featuresInput.value = '';
}

function showCreateIntroduction() {
    document.getElementById("selectionPage").style.display = "none";
    document.getElementById("createIntroduction").style.display = "inline";
    document.getElementById("showcase").style.display = "none";
}

function showSelectionPage() {
    document.getElementById("selectionPage").style.display = "flex";
    document.getElementById("createIntroduction").style.display = "none";
    document.getElementById("showcase").style.display = "none";
}

function clearCreateIntroductionPage() {
    document.getElementById("title").value = '';
    temporaryFeatures = [];
    document.getElementById("explanation").value = '';
    imagesInput = [];
    imageFiles = []

    document.getElementById("featuresInput").value = '';

    clearPage("featuresIntroduction");
    clearPage("imagesIntroduction");
}

function clearShowcasePage() {
    const showcase = document.getElementById("showcase");
    while (showcase.children[1]) {
        showcase.removeChild(showcase.children[1]);
    }
}

function clearPage(pageId) {
    let page
    if (typeof(pageId) === "string") {page = document.getElementById(pageId);}
    else {page = pageId}
    while (page.firstChild) {
        page.removeChild(page.firstChild);
    }
}

function saveIntroduction() {
    product.name = document.getElementById("title").value;
    product.features = temporaryFeatures;
    product.explanation = document.getElementById("explanation").value;
    product.images_urls = imagesInput;

    for (let key in product) {
        if (product[key].length === 0) {alert("تمام گزینه ها را پر کنید"); return;}
    }

    //We should new object for array with {}
    products.push({name: product.name, features: product.features, explanation: product.explanation, images_urls: product.images_urls});
    //localStorage.setItem("products", JSON.stringify(products));
    saveIntroductionInServer(products[products.length-1]);
    clearCreateIntroductionPage();
    showSelectionPage();
}

function canselIntroduction() {
    clearCreateIntroductionPage();
    product = {name: '', features: [], explanation: '', images_urls: []};
    showSelectionPage();
}

function showShowcase() {
    document.getElementById("selectionPage").style.display = "none";
    document.getElementById("createIntroduction").style.display = "none";
    const showcase = document.getElementById("showcase");
    showcase.style.display = "grid";
    showcase.style.gridTemplateColumns = "1fr 1fr 1fr";
    showcase.style.gap = "20px";

    if (products.length === 0) {
        const h1 = document.createElement("h1");
        showcase.appendChild(h1);
        h1.textContent = "هیچ محصولی در اینجا نیست";
        return;
    }

    for (let i=0; i<products.length; i++) {
        const a_product = products[i];
        const images_urls = a_product.images_urls
        const heroImage = images_urls[0];
        const title = a_product.name;

        const div = document.createElement("div");
        const h2 = document.createElement("h2");
        const button = document.createElement("button");

        
        showcase.appendChild(div);
        createElementImage(heroImage, div);
        div.appendChild(h2);
        div.appendChild(button);

        div.style.display = "flex";
        div.style.flexDirection = "column";

        h2.textContent = title;
        button.textContent = "اطلاعات بیشتر...";
        button.addEventListener(
            "click", function() {
                showcase.style.display = "none";
                const features = a_product.features
                const showProduct = document.createElement("div");
                showProduct.id = "showProduct"+i
                document.body.appendChild(showProduct);

                const backButton = document.createElement("button");
                backButton.id = "backOfPage";
                backButton.textContent = "برگشت";
                showProduct.appendChild(backButton);
                backButton.width = "47px";
                backButton.height = "23px";
                backButton.addEventListener("click", function() {
                    showcase.style.display = "grid"; clearPage(showProduct);
                })

                const h1 = document.createElement("h1");
                showProduct.appendChild(h1);

                for (let i=0; i<images_urls.length; i++) {
                    createElementImage(images_urls[i], showProduct);
                }

                const h3 = document.createElement("h3");
                showProduct.appendChild(h3);
                h3.textContent = "ویژگی ها";

                const ul = document.createElement("ul");
                showProduct.appendChild(ul);
                ul.id = "productUl"
                
                for (let i=0; i<features.length; i++) {
                    createElementList(features[i], ul);
                }

                const pre = document.createElement("pre");
                showProduct.appendChild(pre);
                pre.textContent = a_product.explanation;
            }
        )
    }

}

function hideShowcase() {
    showSelectionPage()
    clearShowcasePage()
}

async function saveIntroductionInServer(_product) {
    const formData = new FormData();
    formData.append("product_string", JSON.stringify(_product));

    //for (let image of imageFiles) {formData.append("image_files", image)}

    const res = await fetch(`${pathServer}products`, {
        method: "POST",
        body: formData
    })

    const data = await res.json();
}


const testData = {
    name: "test",
    features: ["a"],
    explanation: "test",
    images_urls: []
};

fetch("https://productshowcase-lhrz.onrender.com/products", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(testData)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);