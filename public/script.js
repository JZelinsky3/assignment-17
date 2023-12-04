const getCars = async () => {
    try {
        return (await fetch("/api/cars")).json();
    } catch (error) {
        console.error(error);
    }
}

const showCars = async () => {
    let cars = await getCars();
    let carsDiv = document.getElementById("car-list");
    carsDiv.classList.add("flex-container");
    carsDiv.classList.add("wrap");
    carsDiv.innerHTML = "";

    cars.forEach((car) => {
        const section = document.createElement("section");
        section.classList.add("car-model");
        carsDiv.append(section);

        const a = document.createElement("a");
        a.href = "#";
        section.append(a);

        const h3 = document.createElement("h3");
        h3.innerHTML = car.make + " " + car.model;
        a.append(h3);

        const img = document.createElement("img");
        img.src = car.img;
        section.append(img);

        a.onclick = (e) => {
            e.preventDefault();
            document.getElementById("hide-details").classList.remove("hidden");
            displayDetails(car);
        };

        const editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        section.append(editButton);

        editButton.onclick = (e) => {
            e.preventDefault();
            document.querySelector(".dialog").classList.remove("transparent");
            document.getElementById("add-edit").innerHTML = "Edit Car Details";
            populateEditForm(car);
        };

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        section.append(deleteButton);

        deleteButton.onclick = async (e) => {
            e.preventDefault();
            const confirmation = window.confirm("Are you sure you want to delete this car?");
            if (confirmation) {
                await deleteCar(car);
            }
        };
    });
};

const displayDetails = (car) => {
    const carDetails = document.getElementById("car-details");
    carDetails.innerHTML = "";
    carDetails.classList.add("flex-container");

    const h3 = document.createElement("h3");
    h3.innerHTML = car.make + " " + car.model;
    carDetails.append(h3);
    h3.classList.add("spacing");

    const p1 = document.createElement("p");
    carDetails.append(p1);
    p1.innerHTML = 'Year: ' + car.year;
    p1.classList.add("spacing");

    const p2 = document.createElement("p");
    carDetails.append(p2);
    p2.innerHTML = 'Type: ' + car.type;
    p2.classList.add("spacing");

    const ul = document.createElement("ul");
    carDetails.append(ul);
    ul.classList.add("spacing");

    car.chars.forEach((char) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = char;
    });

    const editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    carDetails.append(editButton);

    editButton.onclick = (e) => {
        e.preventDefault();
        document.querySelector(".dialog").classList.remove("transparent");
        document.getElementById("add-edit").innerHTML = "Edit Car Details";
    };

    populateEditForm(car);
};

const deleteCar = async (car) => {
    let response = await fetch(`/api/cars/${car._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
    
      if (response.status != 200) {
        console.log("error deleting");
        return;
      }
    
      let result = await response.json();
      showCars();
      document.getElementById("car-details").innerHTML = "";
      resetForm();
};

const populateEditForm = (car) => {
    const form = document.getElementById("car-form");
    console.log(car._id);
    form._id.value = car._id;
    form.make.value = car.make;
    form.model.value = car.model;
    form.year.value = car.year;
    form.type.value = car.type;

    document.getElementById("char-group").innerHTML = "";

    car.chars.forEach((char) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = char;
        document.getElementById("char-group").appendChild(input);
    });
};

const addEditCar = async (e) => {
    e.preventDefault();
    const form = document.getElementById("car-form");
    const formData = new FormData(form);
    const dataStatus = document.getElementById("data-status");
    let response;
    formData.append("chars", getChars());

    if (form._id.value == -1) {
        formData.delete("_id");
        console.log(formData);
        response = await fetch("/api/cars", {
            method: "POST",
            body: formData
        });
    } else {
        console.log(...formData);

        response = await fetch(`/api/cars/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    if (response.status !== 200) {
        dataStatus.classList.remove("hidden");
        dataStatus.innerHTML = "Error with Data!";
        setTimeout(() => {
            dataStatus.classList.add("hidden");
        }, 3000);
        console.error("Error with data");
        return;
    }

    car = await response.json();

    if (form._id.value != -1) {
        displayDetails(car);
      }

    resetForm();
    document.querySelector(".dialog").classList.add("transparent");
    showCars();
};

const getChars = () => {
    const inputs = document.querySelectorAll("#char-group input");
    let chars = [];

    inputs.forEach((input) => {
        chars.push(input.value);
    });

    return chars;
}

const resetForm = () => {
    const form = document.getElementById("car-form");
    form.reset();
    form._id.value = "-1";
    document.getElementById("char-group").innerHTML = "";
};

const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("add-edit").innerHTML = "Add Car";
    resetForm();
};

const addChar = (e) => {
    e.preventDefault();
    const section = document.getElementById("char-group");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
}

window.onload = () => {
    showCars();
    document.getElementById("car-form").onsubmit = addEditCar;
    document.getElementById("add-link").onclick = showHideAdd;

    document.querySelector(".close").onclick = () => {
        document.querySelector(".dialog").classList.add("transparent");
    };

    document.getElementById("add-char").onclick = addChar;
};