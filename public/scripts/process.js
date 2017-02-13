(function () {
    
    
     /* Form Contact Ajax Uploud Section
    **************************************************************************/

    $(document).on('click', ".ajax-submit", function (e) {
        e.preventDefault();
        var ajaxSubmit = $(this);
        var form = $(this).closest('form');
        var url = form.attr('action');
        var ajaxSubmitHtml = ajaxSubmit.html();
        var altText = ajaxSubmitHtml;

        if (ajaxSubmit.data('loading') !== undefined) {
            altText = ajaxSubmit.data('loading');
        }

        ajaxSubmit.prop('disabled', true).html(altText);

        var formData = new FormData(form[0]);
        
        if(form.attr('method') == 'get' || form.attr('method') == 'GET'){
            formData = form.serialize();
        }
      
        if (ajaxSubmit.data('url') !== undefined) {
            url = ajaxSubmit.data('url');
        }

        request(url, formData, function (result) {
            ajaxSubmit.prop('disabled', false).html(ajaxSubmitHtml);
            
            _(result);
            
        }, function () {
            alert('Internal Server Error.');
        },form.attr('method'));
    });
    

        /***************************************************************************
        * Custom logging function
        * @param mixed data
        * @returns void
        **************************************************************************/
        function _(data) {
            console.log(data);
        }

        /***************************************************************************
        * Custom Ajax request function
        * @param string url
        * @param mixed|FormData data
        * @param callable(data) completeHandler
        * @param callable errorHandler
        * @param callable progressHandler
        * @returns void
        **************************************************************************/
        function request(url, data, completeHandler, errorHandler, progressHandler) {
            if (typeof progressHandler === 'string' || progressHandler instanceof String) {
                method = progressHandler;
            } else {
                method = "POST"
            }

            $.ajax({
                url: url, //server script to process data
                type: method,
                xhr: function () {  // custom xhr
                    myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) { // if upload property exists
                        myXhr.upload.addEventListener('progress', progressHandler, false); // progressbar
                    }
                    return myXhr;
                },
                // Ajax events
                success: completeHandler,
                error: errorHandler,
                // Form data
                data: data,
                // Options to tell jQuery not to process data or worry about the content-type
                cache: false,
                contentType: false,
                processData: false
            }, 'json');
        }



    })();
