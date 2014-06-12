$(window).ready(function() {	

	//To help refactor this horrible naming scheme eventually...
	var graphSaveButtonId = '#plumb-graph-save';
	var drawButtonId = 		'#plumb-draw-button';
	var modeButtonId = 		'#plumb-mode-button';
	var transButtonId = 	'#plumb-add-transition-button';
	var toolboxId = 		'#plumb-toolbox';
	var stateIdClass = 		'.plumb-state-id';
	var stateClass = 		'.plumb-state';
	var canvasId = 			'#plumb-canvas';
	var workflowId = 		'#plumb-workflow';
	var layoutContainerId = '#plumb-layout-container';
	var containerId = 		'#plumb-container';
	var labelClass = 		'.plumb-label';
	var helpMessageId =		'#plumb-help-message';
	var formBtn = 			'.plumb-form-btn';
	var formHolder = 		'#plumb-form-holder';
	var formOverlay = 		'#plumb-overlay';

	var transDescClass = 	'.transition-description';
	var transTitleClass = 	'.transition-title';
	var transIdClass =		'.transition-id';
	var transLinkClass = 	'.transition-link';

	var pathClass = 		'.plumb-path';
	var pathStartClass = 	'.plumb-path-start';
	var pathEndClass = 		'.plumb-path-end';
	var pathTransitionClass =
							'.plumb-path-transition';

	$('#fieldsetlegend-graph').live('click', function() {
		
		$(canvasId).disableSelection();
		buildGraph();
	});

	$(modeButtonId).live('click', function() {

		var states = $(canvasId + ' > ' + stateClass);

		if($(this).hasClass('view')){

			setDesignMode(states);
		}else if($(this).hasClass('design')){

			setViewMode(states);
		}
	});

	$(transButtonId).live('click', function() {

		addEndpoints();
	})

	$('#tabs-menu a[id^="fieldsetlegend-"]').live('click', function() {

		//Set the page to view mode if
		//the user clicks one of the "fieldsetlegend" tabs.
		if( $(stateClass).css('display') != 'none' )
		{
			setViewMode(getStateDivs());
		}
	});

	$(stateClass).live('click', function() {

		expandState($(this));
	});

	$(stateIdClass).hover(function() {

		$(this).addClass('highlight');
	},
	function() {
		$(this).removeClass('highlight');
	});

	$(graphSaveButtonId).live('click', function() {

		var options = {
			beforeSerialize: setLayout,
			success: function() {
				alert("Layout saved successfully.");
				setViewMode(getStateDivs());
			}
		};

		$('#plumb-layout-form').ajaxSubmit(options);
	})

	$(formBtn).live('click', function(e) {
		//This function is deprecated.
		//I'm just keeping it around temporarily as a reference
		return true;

		// e.preventDefault();
		// var form = $(this).attr('rel');

		// //Grab the form and stick it into the formHolder
		// var elements = $(form).find('form').clone();

		// //Add 2 more divs to organize things
		// $(elements).append('<div id="formTabs"></div>');
		// $(elements).append('<div id="formPanes"></div>');

		// $(formHolder).append(elements);

		// //Add an anchor for each fieldset
		// $(elements).find('legend').each(function() {
		// 	$('#formTabs').append('<div><a href="#">' + $(this).text() + '</a></div>');
		// });

		// //Add the individual fieldsets back
		// $(elements).find('fieldset').each(function() {
		// 	$('#formPanes').append('<div>' + $(this).html() + '</div>');
		// });

		// //Get rid of the old .item-properties fieldsets
		// $(elements).find('.item-properties').remove();

		// //say the magic words
		// $('#formTabs').tabs('#formPanes > div')

		// $(this).overlay({
		// 	mask: {
		// 		color: '#333',
		// 		opacity: 0.9,
		// 	},
		// 	target: formHolder,
		// 	load: true,
		// 	close: '.close-btn',
		// 	closeOnClick: false,
		// 	onClose: function() {
		// 		//Clean out the formHolder before we use it again.
		// 		$(formHolder).find('form:not(.navbar-form)').remove();
		// 	},
		// 	onBeforeLoad: function() {
		// 		console.log('here');
		// 	},
		// });
	});

	function addEndpoints()
	{
		var dropOptions = {
			anchor: "Continuous",
			isSource: true,
			connector: "StateMachine",
			scope: "newTransitions",
		};

		var stateBoxes = $(stateClass);

		stateBoxes.each(function() {
			jsPlumb.addEndpoint($(this), dropOptions);
		});

		jsPlumb.makeTarget(stateBoxes, {
			scope: "newTransitions",
			hoverClass: "highlight",
			anchor: "Continuous",
		});

		jsPlumb.repaintEverything();

		jsPlumb.bind("connection", function(info, dropOptions) {

			var source = info['sourceId'];
			var target = info['targetId'];

			var pts = jsPlumb.selectEndpoints({scope:"newTransitions"});
			var endPts = pts.getParameter();

			$(endPts).each(function() {
				if( !( this[1].elementId == source || this[1].elementId == target ) )
				{
					this[1].detach();
				}
			})
			addConnection(info);
		});
	}

	function addConnection(info, options)
	{
		var source = info['sourceId'];
		var target = info['targetId'];

		var paths = $(pathClass);

		paths.each(function() {
			var start = 'plumb-state-' + $(this).find(pathStartClass).text();
			var end = 'plumb-state-' + $(this).find(pathEndClass).text();

			if( end == target && start == source )
			{
			}
		});
	}

	function buildConnections(paths)
	{
		$(paths).each(function() {

			var start_id = $(this).find('div' + pathStartClass).text();
			var end_id = $(this).find('div' + pathEndClass).text();

			var e0 = 'plumb-state-' + start_id;
			var e1 = 'plumb-state-' + end_id;

			var path_label = $(this).find(pathTransitionClass).text();

			jsPlumb.connect({ 
				source:e0,
				target:e1,
				connector:"StateMachine",
				hoverPaintStyle:{ strokeStyle:"gold" },
				overlays:[
				["Arrow", {location:1, width:10}],
				["Label", { 
					label:path_label, 
					location:0.2, 
					cssClass:"plumb-label",
					events:{
						//Defining the event here is the only effective way, 
						//since jsPlumb makes it difficult/impossible to add a listener
						//outside the connection definition
          				click:function(labelOverlay, originalEvent) { 

            				expandTransition(originalEvent.currentTarget);
          				}
        			}
        		}]
				],
				anchor: "Continuous",
				endpoint: "Blank",
				paintStyle:{ strokeStyle:"black", lineWidth:1.5 },
			});
		});
	}

	buildGraph = function()
	{

		//if the connectors exist, 
		//the graph is already complete.
		if( $('._jsPlumb_connector').length > 0 )
		{
			return true;
		}

		$(stateClass).css('display', 'inherit');

		//If we're redrawing on the same page, it helps to clean everything out first
		jsPlumb.reset();

		jsPlumb.Defaults.Container = "plumb-canvas";

		var states = getStateDivs();
		var paths = $(containerId + ' > ' + pathClass);

		distribute(states);

		$(toolboxId).show();

		makeDraggable(states);

		buildConnections(paths);

		wrapOverlays();

		setViewMode(states);
	}

	function disableDragging(states)
	{
		//this will work with either a single element
		//or an array of them
		$(states).each(function() {
			jsPlumb.setDraggable($(this), false);
		});
	}

	function distribute(divs)
	{
		//this function simply places the divs randomly onto the canvas
		//unless the layout has been saved, then it recreates the saved layout
		var layout = $(layoutContainerId).attr('value');
		

		if( layout.length > 0 )
		{
			layout = JSON.parse(layout);
		}
		else
		{
			layout = {};
		}

		var layoutExists = false;

		$(divs).each(function() {
			if( layout[$(this).find(stateIdClass).text()] ) 
			{
				var top = layout[$(this).find(stateIdClass).text()].top;
				var left = layout[$(this).find(stateIdClass).text()].left;

				$(this).css('top', top);
				$(this).css('left', left);
				layoutExists = true;
			}
			else
			{
				var css_left = Math.ceil(Math.random() * ($('#content').width() - $(this).outerWidth(true)));
				var css_top = Math.ceil(Math.random() * ($(canvasId).height() - $(this).outerHeight(true)));

				$(this).css('top', css_top);
				$(this).css('left', css_left);
			}
		});

		if( layoutExists == false )
		{
			$(helpMessageId).dialog({
				modal: true,
			});
		}
	}

	function enableDragging(states)
	{
		$(states).each(function() {
			jsPlumb.setDraggable($(this), true);
		});
	}

	function expandState(element)
	{

		//Disabling the functionality in design mode.
		if($(modeButtonId).hasClass('design'))
		{
			return true;
		}

		//If the element is already expanded, close it
		//and exit.
		if($(element).hasClass('expanded'))
		{
			$(element).children().hide();
			$(element).find(stateIdClass).show();
			$(element).removeClass('expanded');
			return true;
		}

		var state =  $(element).find(stateIdClass).text();

		$(element).children(':not(fieldset)').show();
		$(element).find(stateIdClass).hide();
		$(element).addClass('expanded');
	}

	function expandTransition(element)
	{
		//Disabling the functionality in design mode.
		if($(modeButtonId).hasClass('design'))
		{
			return true;
		}

		//if the transition is already open, then close it
		//and exit.
		if( $(element).hasClass('expanded')) 
		{
			$(element).removeClass('expanded');
			$(element).find('a, div').remove();
			$(element).find('span').show();
			return true;
		}

		var id = $(element).find('span').text();

		id = '#plumb-transition-' + id;

		var transitionTitle = $(id).find(transTitleClass).text();
		var description = $(id).find(transDescClass).text();

		$(element).addClass('expanded');
		$(element).find('span').hide();
		$(element).append('<div class="plumb-title">' + transitionTitle + '</div>');
		$(element).append('<div>' + description + '</div>');

		var anchor = $(id).find(transLinkClass).clone();
		$(anchor).overlay(overlay_settings);
		$(element).append(anchor);

	}

	function getStateDivs()
	{

		return $(canvasId + ' ' + stateClass);
	}

	function lockScrolling()
	{
		//This isn't as pointless as it seems.
		//By setting the width explicitly, it prevents 
		//the body width from changing when the overflow is changed.
		$('html, body').css('width', $('html, body').css('width'));
		$('html, body').css('overflow', 'hidden');
	}

	function makeDraggable(states)
	{
		//this function is needed to set the 
		//options since you can't pass them to the
		// toggle/disable functions
		$(states).each(function() {
			jsPlumb.draggable($(this), {
				containment: canvasId,
				scroll: false
			});
		});
	}

	function scrollToElement(element)
	{
		$('html, body').animate({
		        scrollTop: $(element).offset().top
		}, 200);
	}

	function setDesignMode(states)
	{
		var element = $(modeButtonId);
		//the class on the button is what mode we're in now
		//the value is the class we would switch to by pressing the button
		element.removeClass('view').addClass('design');
		element.removeClass('btn-inverse').addClass('btn');
		element.prop('value', 'Switch to view mode');

		//lock page scrolling and move down to the
		//graph canvas
		scrollToElement('#menu-container');
		lockScrolling();
	    enableDragging(states);
	}

	function setLayout()
	{
		$(workflowId).attr('value', $('#selected-workflow').attr('value'));
		var states = $(stateIdClass);
		message = {};

		states.each(function() {
			message[$(this).text()] = $(this).parent().position();
		});

		var output = JSON.stringify(message);
		$(layoutContainerId).text(output);
	}

	function setViewMode(states)
	{
		var element = $(modeButtonId);
		element.removeClass('design').addClass('view');
		element.removeClass('btn').addClass('btn-inverse');
		element.prop('value', 'Switch to design mode');

		unlockScrolling();
		disableDragging(states);
	}

	function unlockScrolling()
	{
		$('html, body').css('width', 'inherit');	
		$('html, body').css('overflow', 'auto');
	}

	function wrapOverlays()
	{

		var overlays = $(labelClass);

		overlays.each(function() {

			var text = $(this).text();
			$(this).empty();

			$(this).append('<span>' + text + '</span>');
		})
	}

	buildGraph();
});
