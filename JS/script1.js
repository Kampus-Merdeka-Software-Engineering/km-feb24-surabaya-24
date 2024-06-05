$(document).ready(function() {
    // Fetch the JSON data
    $.getJSON('pizza_places.json', function(data) {
        // Initialize the DataTable
        $('#pizzaOrders').DataTable({
            data: data,
            columns: [
                { data: 'Order Details ID' },
                { data: 'Order ID' },
                { data: 'Pizza ID' },
                { data: 'Pizza Type ID' },
                { data: 'Name' },
                { data: 'Category' },
                { data: 'Size' },
                { data: 'Quantity' },
                { data: 'Price' },
                { data: 'Date' },
                { data: 'Month' },
                { data: 'Day' },
                { data: 'Time' },
                { data: 'Time Rounding\r' }
            ]
        });
    });
});
