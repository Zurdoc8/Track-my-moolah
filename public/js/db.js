let db;

const request = indexDB.open("budget", 1);

request.onUpgradeRequired = function (event) {
    const db = event.target.result;
    db.createObjectStore("pending", {
        autoIncrement: true
    });
};

request.onSuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onError = function (event) {
    console.log("Sad Day" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], 'readwrite');

    const store = transaction.objectStore("pending");

    store.add(record);
};

function checkDatabase() {

    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const getAll = store.getAll();

    getAll.onSuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");

                const store = transaction.objectStore("pending");

                store.clear();
            })
        }
    }
}

window.addEventListener("online", checkDatabase);