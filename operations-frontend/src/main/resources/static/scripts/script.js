function loadPageContent(url, goingForward = true) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            // Replace the main content with the new page's content
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            document.getElementById('main-content').innerHTML = doc.getElementById('main-content').innerHTML;
            if (goingForward) {
                if (!window.history.state) {
                    window.history.pushState([url], '', url);
                } else {
                    let state = window.history.state
                    state.push(url)
                    window.history.pushState(state, '', url)
                }
            }
            else {
                if (!window.history.state || window.history.state.length === 0) {
                    let state = window.history.state
                    state.pop()
                    window.history.pushState(state, '', url)
                }
            }
            document.querySelectorAll('#main a').forEach(link => {
                link.addEventListener('click', loadWithoutReloading);
            });
            let closeBtn = document.getElementById('close')
            if (closeBtn) {
                setTimeout(() => {
                    closeBtn.click()
                }, 5000)
            }
        });
}

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.length > 0) {
        let state = event.state
        let url = state.pop()
        loadPageContent(url, false);
    }
});

window.addEventListener('load', function () {
    window.history.pushState([window.location.href], '', window.location.href)
    let uri = window.location.pathname
    if (uri.length > 1) {
        let location = uri.substring(1)
        document.title = `Dashboard - ${location.charAt(0).toUpperCase() + location.slice(1).toLowerCase()}`
    } else {
        document.title = `Dashboard - Home`
    }
})

function loadWithoutReloading(event) {
    event.preventDefault();
    let state = window.history.state
    if (!(state && state.length > 0 && state[state.length - 1] == event.target.href)) {
        let url = event.target.href
        if (!url) {
            url = event.target.parentElement.href
        }
        loadPageContent(url);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('#main a').forEach(link => {
        link.addEventListener('click', loadWithoutReloading);
    });
    let closeBtn = document.getElementById('close')
    if (closeBtn) {
        setTimeout(() => {
            closeBtn.click()
        }, 5000)
    }
    if (window.innerWidth < 600) {
        resizeUI()
    }
});

function resizeUI() {
    const menu = document.getElementById('menu')
    const links = menu.querySelectorAll('a')
    const icons = menu.querySelectorAll('span')
    for (let i = 0; i < links.length; i++) {
        links[i].innerHTML = ''
        links[i].appendChild(icons[i])
    }
    const navbar = document.querySelector('nav')
    navbar.classList.add('w-100')
    const table = document.querySelector('table')
    table.setAttribute('style', 'width: 50vw;')
    const tableBtns = table.querySelectorAll('.btn')
    tableBtns.forEach(btn => {
        btn.classList.add('btn-sm')
    })
}

