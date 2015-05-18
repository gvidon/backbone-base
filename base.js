(function(root) {
	// Import routine
	if (typeof exports !== 'undefined' && typeof require !== 'undefined')
		var
			_ = root._ || require('underscore'),
			Backbone = root.Backbone || require('backbone');
	else
		var
			_ = root._,
			Backbone = root.Backbone;

	Backbone.BaseView = Backbone.View.extend({
		// Make node visible when activating view
		activate: function(state) {
			var
				isActivation = state || _.isUndefined(state);

			this.$el.prop('hidden', !isActivation);

			// Enable events handlers when View is active
			this.undelegateEvents();
			isActivation && this.delegateEvents(this.events);

			return this;
		},
		
		deactivate: function() { return this.activate(false); },

		initialize: function(options) {
			this.app     = (options || {}).app;
			this.layout  = {};
			this.options = options;
			this.parent  = (options || {}).parent;
		},

		isActive: function() { return !this.$el.prop('hidden'); }
	});

	Backbone.BaseListView = Backbone.BaseView.extend({
		// Create and render view based on passed model
		add: function(model) {
			this.addItemView(_.last(this.layout.items = this.layout.items.concat(new this.ItemView({
				app: this.app,
				model: model,
				parent: this
			}))).render(), this.options.container);

			return this;
		},
		
		// Append item view to the list node
		addItemView: function(view, container) { (container && this.$(container) || this.$el).append(view.el); return this; },

		// Iterate over items, stop handling events and remove nodes
		clear: function() {
			_.each(this.layout.items, function(I) { (_.result(I, 'deactivate') || I).undelegateEvents(); I.remove(); });
			this.layout.items = [];
			return this;
		},

		initialize: function(options) {
			Backbone.BaseView.prototype.initialize.call(this, options);
			this.ItemView = (options || {}).ItemView || this.ItemView;
			this.layout = {items: []};
		},

		reset: function(collection) {
			// Get rid of event handlers for collection that is about to be replaced
			this.collection && this.collection.off(null, null, this);

			this.clear();
			this.collection = collection;

			// Remove item from list once it was removed from collection
			this.collection.on && this.collection.on('remove', function(model, collection, options) {
				var
					item = _.find(this.layout.items, function(I) { return I.model.id == model.id; });

				this.layout.items = _.without(this.layout.items, item);
				item.$el.fadeOut(function() { item.remove() });
			}, this);

			this.collection && this.collection.each(this.add, this);

			return this;
		}
	});
})(window || global || this);