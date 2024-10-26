$(document).ready(function() {
    let mediaSection = $('.media-section');
    let msg = $('#msg');
    let form = $('#form');
    let convertBtn = $('[data-is="convert"]');
    let url = $('[data-is="url"]');

    // Add input animation
    url.on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).parent().removeClass('focused');
        }
    });

    form.on('submit', function(e) {
        e.preventDefault();
    });

    convertBtn.on('click', function() {
        if (!url.val()) {
            showError('Please enter a valid YouTube URL');
            return;
        }

        getToken();
    });

    function showError(message) {
        msg.html(`<i class="fas fa-exclamation-circle"></i> ${message}`);
        msg.removeClass('hide').hide().fadeIn();
        mediaSection.addClass('hide');
    }

    function hideError() {
        msg.addClass('hide');
    }

    function showLoading(button) {
        button.addClass('loading');
        button.prop('disabled', true);
    }

    function hideLoading(button) {
        button.removeClass('loading');
        button.prop('disabled', false);
    }

    function getToken() {
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                url: url.val(),
                type: state.page,
                api: 'token'
            },
            beforeSend: function() {
                showLoading(convertBtn);
                convertBtn.text('Converting...');
                hideError();
            },
            success: function(response) {
                if (response.response.error) {
                    showError(response.response.error);
                    return;
                }

                let data = response.response.data;
                displayMedia(data);
            },
            error: function() {
                showError('Something went wrong. Please try again.');
            },
            complete: function() {
                hideLoading(convertBtn);
                convertBtn.text('Convert ' + state.page.toUpperCase());
            }
        });
    }

    function displayMedia(data) {
        let html = `
            <div class="media-card">
                <div class="media-thumbnail">
                    <img src="${data.thumbnail}" alt="${data.title}">
                </div>
                <div class="media-info">
                    <h2 class="media-title">${data.title}</h2>
                    <div class="media-meta">
                        <span><i class="far fa-clock"></i> ${data.duration}</span>
                    </div>
                    <div class="download-options">`;

        for (let key in data.links) {
            let link = data.links[key];
            html += `
                <div class="download-option">
                    <span class="quality"><i class="fas fa-video"></i> ${link.q}</span>
                    <span class="size"><i class="fas fa-file-alt"></i> ${link.size}</span>
                    <button class="btn btn-download" onclick="downloadFile('${data.vid}', '${link.k}')">
                        <i class="fas fa-download"></i> Download ${state.page.toUpperCase()}
                    </button>
                </div>`;
        }

        html += `
                    </div>
                </div>
            </div>`;

        mediaSection.html(html);
        mediaSection.removeClass('hide').hide().fadeIn();
    }

    window.downloadFile = function(vid, k) {
        let downloadBtn = $(event.target);
        $.ajax({
            url: 'api.php',
            method: 'POST',
            data: {
                vid: vid,
                k: k,
                api: 'download'
            },
            beforeSend: function() {
                showLoading(downloadBtn);
                downloadBtn.text('Preparing download...');
            },
            success: function(response) {
                if (response.response.error) {
                    showError(response.response.error);
                    return;
                }

                let downloadUrl = response.response.data.dlink;
                let a = document.createElement('a');
                a.href = downloadUrl;
                a.download = '';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            error: function() {
                showError('Download failed. Please try again.');
            },
            complete: function() {
                hideLoading(downloadBtn);
                downloadBtn.html('<i class="fas fa-download"></i> Download ' + state.page.toUpperCase());
            }
        });
    };
});