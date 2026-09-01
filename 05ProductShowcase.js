let product = {name: '', features: [], explanation: '', images_urls: [], user_id: 0};
let products = [];
let imagesInput = [];
let imageFiles = [];
let temporaryFeatures = [];

const pathServer = "http://localhost:8000/" //"https://productshowcase-lhrz.onrender.com/"

async function fillProducts() {
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
    }
}

function showSnackbar(text) {
    const snackbar = document.getElementById("snackbar");
    snackbar.innerText = text;
    snackbar.className = "show";
    setTimeout(function(){snackbar.className = snackbar.className.replace("show", "");}, 3000)
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
    if (!src.startsWith("http") && !src.startsWith("blob")) {
        src = pathServer + src;
    }

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
    if (!localStorage.getItem("token")) {
        document.getElementById("authModal").classList.add("show");
        return
    }

    document.getElementById("selectionPage").style.display = "none";
    document.getElementById("createIntroduction").style.display = "inline";
    document.getElementById("showcase").className = "";
}

function showSelectionPage() {
    document.getElementById("selectionPage").style.display = "flex";
    document.getElementById("createIntroduction").style.display = "none";
    document.getElementById("showcase").className = "";
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
    showcase.className = "";
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
    product.user_id = localStorage.getItem("user_id");

    for (let key in product) {
        if (product[key].length === 0) {alert("تمام گزینه ها را پر کنید"); return;}
    }

    //We should new object for array with {}
    products.push({name: product.name, features: product.features, explanation: product.explanation, images_urls: product.images_urls, user_id: product.user_id});
    saveIntroductionInServer(products[products.length-1]);
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

    if (products.length === 0) {
        showcase.className = "noProduct"
        const h1 = document.createElement("h1");
        showcase.appendChild(h1);
        h1.textContent = "هیچ محصولی در اینجا نیست";
        return;
    }
    else {
        showcase.className = "show"
    }

    for (let i=0; i<products.length; i++) {
        const a_product = products[i];
        const images_urls = a_product.images_urls;
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
                showcase.className = "none";
                const features = a_product.features
                const showProduct = document.createElement("div");
                showProduct.id = "showProduct"+i;
                document.body.appendChild(showProduct);

                const backButton = document.createElement("button");
                backButton.className = "backOfPage";
                backButton.textContent = "برگشت";
                showProduct.appendChild(backButton);
                backButton.width = "47px";
                backButton.height = "23px";
                backButton.addEventListener("click", function() {
                    showProduct.remove();
                    showcase.className = "show";
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
                ul.id = "productUl";
                
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

    for (let image of imageFiles) {formData.append("image_files", image)}

    showSnackbar("در حال ذخیره کردن...");

    try {
        const res = await fetch(`${pathServer}products`, {
            method: "POST",
            body: formData
        })

	if (res.ok) {
	    showSnackbar("محصول ذخیره شد.");
        clearCreateIntroductionPage();
        showSelectionPage();
        const data = await res.json();
        console.log(data);

	} else {showSnackbar("نتوانستیم محصول را ذخیره کنیم! کد: " + res.status);}

    }
    catch (err) {
	showSnackbar("نتوانستیم ذخیره کنیم. ارور: " + err);
    }
}

function backToIndexHTML() {
    location.href = "index.html";
}

async function signUp() {
    document.getElementById("signUp").addEventListener("submit", async (e) => {e.preventDefault();})

    const fullName = document.getElementById("signUpFullNameInput").value;
    const username = document.getElementById("signUpUsernameInput").value;
    const password = document.getElementById("signUpPasswordInput").value;
    const confirmPassword = document.getElementById("signUpConfirmPasswordInput").value;

    if (fullName === "" || username === "" || password.length === "" || confirmPassword === "") {return}

    if (username.includes(" ")) {
        showSnackbar("نام کاربری نباید فاصله داشته باشد");
        return;
    }

    if (password.includes(" ")) {
        showSnackbar("رمز نباید فاصله داشته باشد");
        return;
    }

    if (password.length < 4) {
        showSnackbar("رمز عبور باید بالای 4 حرف باشد");
        return;
    }

    if (password !== confirmPassword) {
        showSnackbar("تکرار رمز عبور نادرست هست");
        return;
    }

    const user = {
        "full_name": fullName,
        "username": username,
        "password": password,
        "confirm_password": confirmPassword
    }

    try {
        const res = await fetch(pathServer+"api/sign-up", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user)
        })
        
        const data = await res.json();
    
        if (res.ok) {
            location.href = "index.html"
            localStorage.setItem("token", data.token);
            showSnackbar("با موفقیت ثبت نام کردید.");

        } else {
            showSnackbar(data.detail);
            console.log(data);
        }
        
    } catch (err) {
        showSnackbar("نتوانستید به سرور متصل بشید."+err);
        console.error("خطا ",err)
    }
}

async function login() {
    document.getElementById("login").addEventListener("submit", async (e) => {e.preventDefault();})
    
    const username = document.getElementById("loginUsernameInput").value;
    const password = document.getElementById("loginPasswordInput").value;

    if (username === "" || password === "") {return;}

    const user = {
        "username": username,
        "password": password
    }

    try {
        const res = await fetch(pathServer+"api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user)
        })
    
        const data = await res.json();
        console.log(data);

        if (res.ok) {
            localStorage.setItem("token", data.token)
            showSnackbar("وارد حسابتان شدید");
            location.href = "index.html";

        } else {showSnackbar(data.detail);}

    }catch (err) {
        console.error(err)
        showSnackbar("خطا: "+err)
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("full_name");
}

async function checkAuth() {
    if (!location.pathname.includes("index.html")) {return}

    const token = localStorage.getItem("token");
    if (!token) {return;}

    try {
        const res = await fetch(pathServer+"api/verify-token", {
            headers: {"Authorization": "Bearer " + token}
        })

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("username", data.username);
            localStorage.setItem("full_name", data.full_name);
            localStorage.setItem("user_id", data.user_id);
            document.getElementById("buttonLogin").style.display = "none";
            document.getElementById("buttonSignUp").style.display = "none";
            document.getElementById("welcome").innerText = data.message;

        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("full_name");
            localStorage.removeItem("user_id");
        }

    }catch (err) {
        console.error("خطا در بررسی توکن: "+err);
    }
}

function closeModal() {
    document.getElementById("authModal").classList.remove("show")
}

onload = async function checkConnectToServer() {
    if (!location.pathname.includes("index.html")) {return;}
    showSnackbar("در حال اتصال به سرور...");

    try {
        const res = await fetch(pathServer+"products");

        if (res.ok) {showSnackbar("به سرور متصل شدید.");}
        else {showSnackbar(`نتوانستیم به سرور متصل بشیم. خط: ${res.status}`);}
        console.log(res.status);
    }

    catch (err) {
	console.error("خطا:", err);
	showSnackbar("ارور:"+err);
    }
}

fillProducts();