#backbone-base
We have been using ```backbone.js``` for about 3 years now and we like it. It is
not a framework but complete and solid base for frontend application. It doesn't
dictate you how to organize application structure, it is aimed to provide you with
basic tools like views, models and urls dispatcher. So you have more choices when
it comes to application structure and design.

Our long time experience with backbone.js resulted in an application design approach
and base objects I'd like to share with everyone.

###Views hierarchy — BaseView
By *view* I actually mean object derived from ```Backbone.View``` which is responsible
for visual representation. In our applications any view can access any other view
without using global varibales. We achieved this with views hierarchy — placing all
symantical descendants of a certain view in its ```.layout``` attribute.

For example we will place instance of menu of profile page in
```.layout.menu``` of ```ProfileView``` instance. Or we will keep Inbox page of Messages
module in ```.layout.inbox```. ```.layout``` can be used for everything
that is deeper in hierarchy than current object — UI parts of a page, pages
of a section, modules of application and so on.

```javascript
var ProfileView = BaseView.extend({
	render: function() {
		this.layout.billing = (new BillingView({el: '#billing'})).render();
		this.layout.menu = (new MenuView({el: '#menu'})).render();
		this.layout.settings = (new SettingsView({el: '#settings'})).render();

		return this;
	}
})
```

The only starting point for hierarchy is ```.app``` attrbiute of a view where the application
instance is kept. Application itself is considered to be the view which initiates all other views.
Using ```.app``` any view can call other views methods in a simple way:

```javascript
// Get unread messages from application inbox
this.app.layout.messages.layout.inbox.getUnread()
```

Sometimes it is more convenient to access another view through parent view, instead of getting
accross long chain of ```.layout```. In this case one can find useful ```.parent```
attribute which passed to a view with ```parent``` option.

```javascript
// In .messages.layout.inbox view call method of messages.layout.spam view — put message in a spam box
this.parent.layout.spam.add(message)
```

With all this in mind we get to very common base view for our applications with only ```.initialize()```
method rewritten. What it does is just creating a blank ```.layout``` and accepting ```app```
and ```parent``` options.

```javascript
// BaseView.initialize
initialize: function(options) {
	this.app = (options || {}).app;
	this.parent = (options || {}).parent;
	this.layout = {};
}
```

Any view derived from ```BaseView``` can be initialized like this:

```javascript
// Considering parent view have .app attribute
new InboxView({app: this.app, parent: this})
```

###Lists — BaseListView
Lists are very common for web applications. Certain features may vary but most
list views essentially do the same — iterate over array of initial data and place
items into the list.

Obviously in most cases we consider ```Backbone.Collection```
to be the initial data array. So, what we usually do is iterate over collection of models,
wrap model into view and place the view into the list. For later access
we will also put view of each item into array called ```.layout.items```.

This way instead of going with events handlers one may use ```.layout.items``` for such things:
```javascript
// Unselect list item siblings. We are crazy about underscore.js
_.invoke(this.parent.layout.items, 'select', true)
```

We have divided list generation process into reasonable number of steps so that derived
list views may implement custom features by redefining just small methods instead of rewriting
everything. Important thing is that ```BaseListView``` has ```.ItemView``` property
which holds object used for initiating items views. It can be passed as option or defined
within derived view definition:

```javascript
var PersonsView = BaseListView.extend({
	ItemView: BaseView.extend({
		render: function() { this.$el.html(this.template({lastname: this.model.get('lastname'), title: this.model.get('title')})) },
		tagName: 'li',
		template: Handlebars.compile('{{ title }} {{ lastname }}')
	}),

	tagName: 'ul'
})
```

###More views
These two types of views provide us with an extensible base. So we have solid and simple
hierarchy for any application and we have customizable view for most typical
operation on the web — representing data.