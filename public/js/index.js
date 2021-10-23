window.addEventListener('load', event => {
    let tipoCriptografiaSelect = document.getElementById('tipoCriptografia'),
        tipoDescriptografiaSelect = document.getElementById('tipoDescriptografia'),
        tipoInformacaoSelect = document.getElementById('tipoInformacao'),
        tipoInformacaoDescriptografiaSelect = document.getElementById('tipoInformacaoDescriptografia'),
        tipoMidiaDescriptografiaSelect = document.getElementById('tipoMidiaDescriptografia'),
        formCriptografar = document.getElementById('form_criptografar'),
        formDescriptografar = document.getElementById('form_descriptografar'),
        resultadoCriptografia = document.getElementById('resultadoCriptografia'),
        resultadoDescriptografia = document.getElementById('resultadoDescriptografia');

    let limparCampos = (limparTipoInformacao = false) => {
        let elementsNeedHidden = document.getElementsByClassName('need-hidden');

        resultadoCriptografia.innerHTML = "";
        resultadoCriptografia.parentNode.parentNode.classList.add('hidden');
        limparTipoInformacao && (tipoInformacaoSelect.innerHTML = "");

        for (el of elementsNeedHidden) {
            if (el) {
                for (elClass of el.classList) {
                    elClass == 'hidden' && (el.firstChild.value = "");
                }
            }
        }
    };

    let limparCamposDescriptografia = (limparTipoInformacao = false, limparTipoMidia = false) => {
        resultadoDescriptografia.innerHTML = "";
        resultadoDescriptografia.parentNode.parentNode.classList.add('hidden');
        limparTipoInformacao && (tipoInformacaoDescriptografiaSelect.innerHTML = "");
        limparTipoMidia && (tipoMidiaDescriptografiaSelect.innerHTML = "");
    };
    
    tipoCriptografiaSelect.addEventListener('change', event => {
        limparCampos(true);

        let options = JSON.parse(tipoCriptografiaSelect.options[tipoCriptografiaSelect.selectedIndex].dataset.tiposinformacao);
        for (option of options) {
            let opt = document.createElement('option');

            opt.value = option.valor;
            opt.innerHTML = option.descricao;
            opt.selected = option.selected;
            opt.dataset.endpoint = option.endpoint;

            tipoInformacaoSelect.appendChild(opt);
        }
    });

    tipoDescriptografiaSelect.addEventListener('change', event => {
        limparCamposDescriptografia(true);

        let options = JSON.parse(tipoDescriptografiaSelect.options[tipoDescriptografiaSelect.selectedIndex].dataset.tiposinformacao);
        for (option of options) {
            if (option.valor == 'midia') {
                return;
            }
            let opt = document.createElement('option');

            opt.value = option.valor;
            opt.innerHTML = option.descricao;
            opt.selected = option.selected;
            opt.dataset.endpoint = option.endpoint;
            opt.dataset.tiposmidia = JSON.stringify(option.tiposMidia);

            tipoInformacaoDescriptografiaSelect.appendChild(opt);
        }
    });

    tipoInformacaoSelect.addEventListener('change', event => {
        let input = document.getElementsByClassName(tipoInformacaoSelect.value)[0],
            elementsNeedHidden = document.getElementsByClassName('need-hidden');

        for (el of elementsNeedHidden) {
            el.classList.add('hidden');
        }
        input.classList.remove("hidden");

        formCriptografar.action = `${formCriptografar.dataset.action}/${tipoInformacaoSelect.options[tipoInformacaoSelect.selectedIndex].dataset.endpoint}`;

        limparCampos();
    });

    tipoInformacaoDescriptografiaSelect.addEventListener('change', event => {

        formDescriptografar.action = `${formDescriptografar.dataset.action}/${tipoInformacaoDescriptografiaSelect.options[tipoInformacaoDescriptografiaSelect.selectedIndex].dataset.endpoint}`;

        limparCamposDescriptografia(false, true);

        let input = document.getElementsByClassName('midiaDescriptografar')[0];
        input.classList[tipoInformacaoDescriptografiaSelect.value == 'midia' ? 'remove' : 'add']("hidden");
        if (tipoInformacaoDescriptografiaSelect.value == 'midia') {    
            let options = JSON.parse(tipoInformacaoDescriptografiaSelect.options[tipoInformacaoDescriptografiaSelect.selectedIndex].dataset.tiposmidia);
            for (option of options) {
                let opt = document.createElement('option');
    
                opt.value = option.valor;
                opt.innerHTML = option.descricao;
                opt.selected = option.selected;
    
                tipoMidiaDescriptografiaSelect.appendChild(opt);
            }
        }
    });

    tipoCriptografiaSelect.dispatchEvent(new window.Event('change'));
    tipoInformacaoSelect.dispatchEvent(new window.Event('change'));

    tipoDescriptografiaSelect.dispatchEvent(new window.Event('change'));
    tipoInformacaoDescriptografiaSelect.dispatchEvent(new window.Event('change'));

    formCriptografar.addEventListener('submit', event => {
        event.preventDefault();

        let body = new FormData();

        body.append('tipoCriptografia', formCriptografar.elements['tipoCriptografia'].value);
        body.append('tipoInformacao', formCriptografar.elements['tipoInformacao'].value);
        body.append('texto', formCriptografar.elements['texto'].value);
        formCriptografar.elements['midia'].files && formCriptografar.elements['midia'].files[0] 
            && body.append('midia', formCriptografar.elements['midia'].files[0], formCriptografar.elements['midia'].files[0].name);

        fetch(formCriptografar.action, {
            method: formCriptografar.method,
            body
        }).then((resp) => {
            return resp.json();
        }).then((body) => {
            resultadoCriptografia.parentNode.parentNode.classList.remove('hidden');
            resultadoCriptografia.innerHTML = body.result;
        }).catch(() => {
            limparCampos();
        });
    });

    formDescriptografar.addEventListener('submit', event => {
        event.preventDefault();

        let body = new FormData();

        body.append('tipoCriptografia', formDescriptografar.elements['tipoDescriptografia'].value);
        body.append('tipoInformacao', formDescriptografar.elements['tipoInformacaoDescriptografia'].value);
        body.append('texto', formDescriptografar.elements['textoDescriptografar'].value);
        body.append('tipoMidia', formDescriptografar.elements['tipoMidiaDescriptografia'].value);

        fetch(formDescriptografar.action, {
            method: formDescriptografar.method,
            body
        }).then((resp) => {
            return resp.json();
        }).then((body) => {
            console.log(body);
            if (formDescriptografar.elements['tipoInformacaoDescriptografia'].value == 'texto') {
                resultadoDescriptografia.parentNode.parentNode.classList.remove('hidden');
                resultadoDescriptografia.innerHTML = body.result;
            } else {
                const link = document.createElement("a");
                link.href = body.result;
                link.click();
                delete link;
            }
        }).catch(() => {
            limparCamposDescriptografia();
        });
    });
}, false);