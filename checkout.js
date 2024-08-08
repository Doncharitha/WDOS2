document.addEventListener('DOMContentLoaded', () => {
    updateCheckoutTable();
});

function updateCheckoutTable() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const checkoutTableBody = document.querySelector('#checkout-table tbody');
    const totalPriceElement = document.getElementById('total-price');

    checkoutTableBody.innerHTML = ''; // Clear any existing rows

    let totalPrice = 0;

    cart.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>Rs.${item.price.toFixed(2)}</td>
            <td>Rs.${(item.price * item.quantity).toFixed(2)}</td>
        `;
        checkoutTableBody.appendChild(row);
        totalPrice += item.price * item.quantity;
    });

    totalPriceElement.textContent = `Total Price: Rs.${totalPrice.toFixed(2)}`;
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('checkoutButton').addEventListener('click', function() {
        // Get the values of the form inputs
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zipCode').value;
        const nameOnCard = document.getElementById('nameOnCard').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const expMonth = document.getElementById('expMonth').value;
        const expYear = document.getElementById('expYear').value;
        const cvv = document.getElementById('cvv').value;

        // Simple validation check (you can enhance this with more detailed validation)
        if (fullName && email && address && city && state && zipCode && nameOnCard && cardNumber && expMonth && expYear && cvv) {
            // Calculate the delivery date (e.g., 3 days from today)
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 3);
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = deliveryDate.toLocaleDateString(undefined, options);

            // Display the thank you message and the delivery date
            document.getElementById('thankYouMessage').style.display = 'block';
            document.getElementById('deliveryDate').innerText = formattedDate;

            // Optionally, you can clear the form or hide it
            document.getElementById('checkoutForm').style.display = 'none';
        } else {
            alert('Please fill in all required fields.');
        }
    });
});

