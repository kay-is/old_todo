(function(){
  var App;
  App = window.App = Em.Application.create();
  App.ApplicationSerializer = DS.LSSerializer.extend();
  App.ApplicationAdapter = DS.LSAdapter.extend({
    'namespace': 'todo'
  });
  App.Router.map(function(){
    this.resource('todolist', {
      path: '/:list'
    });
    this.resource('edittask', {
      path: '/edit/:id'
    });
    this.route('newtask', {
      path: '/new'
    });
  });
  App.ApplicationRoute = Em.Route.extend({
    init: function(){
      this._super.apply(this, arguments);
      this.store.find('todo');
    }
  });
  App.IndexRoute = Em.Route.extend({
    beforeModel: function(){
      return this.transitionTo('todolist', 'inbox');
    }
  });
  App.TodolistRoute = Em.Route.extend({
    model: function(arg$){
      var list;
      list = arg$.list;
      document.title = 'Todo: ' + list.charAt(0).toUpperCase() + list.substr(1).toLowerCase();
      return this.store.filter('todo', {
        'list': list
      }, function(it){
        return it.get('list') === list;
      });
    }
  });
  App.TodolistController = Em.ArrayController.extend({
    getCount: function(it){
      return this.store.all('todo').filterBy('list', it).length;
    },
    inboxCount: function(){
      return this.getCount('inbox');
    }.property('@each.list'),
    nextCount: function(){
      return this.getCount('next');
    }.property('@each.list'),
    waitingCount: function(){
      return this.getCount('waiting');
    }.property('@each.list'),
    maybeCount: function(){
      return this.getCount('maybe');
    }.property('@each.list'),
    doneCount: function(){
      return this.getCount('done');
    }.property('@each.list'),
    projects: function(){
      var projects;
      projects = {};
      this.store.all('todo').forEach(function(it){
        var project;
        project = it.get('project');
        if (project) {
          projects[project] = true;
        }
      });
      return Object.keys(projects);
    }.property('@each.project'),
    actions: {
      move: function(targetList, task){
        if (targetList === 'out') {
          task.deleteRecord();
          return task.save();
        } else {
          return task.set('list', targetList).save();
        }
      }
    }
  });
  App.NewtaskController = Em.Controller.extend({
    needs: ['todolist'],
    list: 'inbox',
    project: '',
    actions: {
      setproject: function(it){
        this.set('project', it);
      },
      create: function(){
        var input, record;
        input = this.getProperties(['title', 'project', 'list', 'description', 'dueBy']);
        record = this.store.createRecord('todo', input);
        record.save();
        this.set('title', '');
        this.set('project', '');
        this.set('description', '');
        this.transitionTo('index');
      }
    }
  });
  App.EdittaskController = Em.ObjectController.extend({
    needs: ['todolist'],
    actions: {
      setproject: function(it){
        this.set('project', it);
      },
      save: function(){
        var record;
        record = this.get('model');
        record.save();
        this.transitionTo('todolist', record.get('list'));
      },
      cancel: function(){
        var record;
        record = this.get('model');
        record.rollback();
        this.transitionTo('todolist', record.get('list'));
      }
    }
  });
  App.Todo = DS.Model.extend({
    'title': DS.attr('string'),
    'description': DS.attr('string'),
    'project': DS.attr('string'),
    'list': DS.attr('string'),
    'showOut': function(){
      return this.get('list') === 'done';
    }.property('list'),
    'showNext': function(){
      return this.get('list') !== 'next';
    }.property('list'),
    'showWaiting': function(){
      return this.get('list') !== 'waiting';
    }.property('list'),
    'showMaybe': function(){
      return this.get('list') !== 'maybe';
    }.property('list'),
    'showDone': function(){
      var list;
      list = this.get('list');
      return list !== 'done' && list !== 'inbox';
    }.property('list')
  });
  App.TabLiComponent = Em.Component.extend({
    tagName: 'li',
    classNameBindings: ['active'],
    active: function(){
      return this.get('childViews').anyBy('active');
    }.property('childViews.@each.active')
  });
  Em.Handlebars.helper('markdown', function(it){
    if (it) {
      return new Em.Handlebars.SafeString(marked(it));
    }
  });
}).call(this);
