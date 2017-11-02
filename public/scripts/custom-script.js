$( document ).ready(function() {

    $(".delete-notebook").on('click', function(){
        console.log("id: " + this.name);

        var elementId = this.name;

        $.ajax({
            type: "POST",
            url: "/delete",
            // dataType: 'json',
            data: { id: elementId },
            success: function() {
                location.reload();
            },
            error: function(err){
                console.log(err)
            }
        })
    });
});