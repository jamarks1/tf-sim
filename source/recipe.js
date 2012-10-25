enyo.kind({
	name: "Recipe",
	kind: enyo.FittableRows,
	classes: "onyx enyo-fit",
	components: [
		{kind: "Panels", fit: true, classes: "panels-sample-sliding-panels", arrangerKind: "CardArranger", wrap: false, components: [
			{name: "recipeList", components: [ 
				{kind: "List", classes: "enyo-fit", multiSelect: false, touch: true, count: 50, onSetupItem: "setupItem", item: "item1", components: [
						{name: "item1", classes: "panels-sample-sliding-item"}
				]}
			]},

			{name: "environment", components: [
				{kind: "List", classes: "enyo-fit", count: 100, touch: true, onSetupItem: "setupItem", item: "item2", components: [
					{name: "item2", classes: "panels-sample-sliding-item"}
					]}
			]}
		]},
	],
	setupItem: function(inSender, inEvent) {
		this.$[inSender.item].setContent("This is row number" + inEvent.index);
	}

})

	