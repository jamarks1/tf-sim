enyo.kind({
	name: "Recipe",
	kind: enyo.FittableColumns,
	classes: "onyx enyo-fit",
	components: [
		{kind: "Panels", fit: true, classes: "sliding-panels", arrangerKind: "enyo.LeftRightArranger", margin: 0, wrap: false, components: [
			{name: "recipeList", components: [ 
				{kind: "List", classes: "enyo-fit", multiSelect: false, touch: true, count: 50, onSetupItem: "setupItem", item: "item1", components: [
						{name: "item1", classes: "panels-sample-sliding-item"}
				]}
			]},

			{name: "environment", components: [
				{kind: "enyo.Control", classes: "enyo-fit", tag: 'p', content: "Environmental Variables Here"} 
				
			]}
		]},
	],
	setupItem: function(inSender, inEvent) {
		this.$[inSender.item].setContent("This is row number" + inEvent.index);
	}

})

	
