function makeAutocomplete() {
    var cache = {};
    $( "#hayoo" ).autocomplete({
        minLength: 2,
        source: function( request, response ) {
            var term = request.term;
            if ( term in cache ) {
                response( cache[ term ] );
                return;
            }

            $.getJSON( "/autocomplete", request, function( data, status, xhr ) {
                cache[ term ] = data;
                response( data );
            });
        }
    });
}

/* Click handler for the expander/collapser control.
 * me is the <p> element which was clicked.
 * We assume that me.parentNode.nextSibling will
 * be the more div.
 */
function toggle_docs(me) {

  var div = me.parentNode.nextSibling // should be the more div

  $(div).children().each(function(i,e) {
    if (i > 0) { $(e).toggle() }
  });

  if (me.className == "collapser") {
    me.className = "expander"
  } else {
    me.className = "collapser"
  }
  return false;
}

/*
 * makeMores adds a more-toggle div just before any more div
 * which needs to have an control to expand/collapse the
 * documentation section.
 *
 * The children of a more div will be a sequence of P and PRE
 * elements. We always the first child visible. We expand/collapse
 * the documentation by toggling the other children to be visible
 * or hidden.
 *
 * The more-toggle div uses position: absolute to hang itself
 * on the left side of the more div.
 */

function makeMores (target) {

    var t = target ? target : document;
    $(t).find('.more').each(function() {
        var content = $(this).html();
        var textContent = $(this).text();

        $(this).html(textContent)

        var need_toggle = false  // do we need to add a more-toggle div?
        $(this).children().each(function(i,e) {
            if (i > 0) { $(e).toggle(); need_toggle = true; }
        })

        if (need_toggle) {
            var div = document.createElement("div")
            div.innerHTML = '<p class="expander" onclick="toggle_docs(this)">&nbsp;'
            div.className = "more-toggle"
            this.parentNode.insertBefore(div, this)
        }

    });

}

var page = 1
function addPage(reset) {
    if (page < 20) {
        params = {
            "query": currentQuery
        }
        $.get("/ajax/" + page + "/", params, function(d){
            var d1 = $(d);
            makeMores(d1);
            $("#results").append(d1)
            page += 1
        }).always(reset)
    }
}

function makeNextPage() {
    $('#next-page-button').click(function () {
        var btn = $(this)
        btn.button('loading')
        addPage(function () {
            btn.button('reset')
        });
    });
}

$().ready(function() {
    makeAutocomplete()

    makeMores()

    makeNextPage()

    $("#hayoo").focus()
});
