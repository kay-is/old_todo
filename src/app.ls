App = window.App = Em.Application.create!

App.ApplicationSerializer = DS.LSSerializer.extend!
App.ApplicationAdapter = DS.LSAdapter.extend 'namespace':'todo'

App.Router.map !->
  @resource \todolist path:'/:list'
  @resource \edittask path:'/edit/:id'
  @route \newtask path:'/new'

App.IndexRoute = Em.Route.extend do
  before-model:->
    @transition-to \todolist \inbox

App.TodolistRoute = Em.Route.extend do
  model:({list})->
    document.title = 'Todo: ' + list.char-at 0 .to-upper-case! + list.substr 1 .to-lower-case!
    @store.find \todo
    @store.filter \todo, 'list':list, -> (it.get \list) is list

App.TodolistController = Em.ArrayController.extend do
  get-count:->
    @store
    .all \todo
    .filter-by \list it 
    .length

  inbox-count:(-> @get-count \inbox).property \@each.list
  next-count:(-> @get-count \next).property \@each.list
  waiting-count:(-> @get-count \waiting).property \@each.list
  maybe-count:(-> @get-count \maybe).property \@each.list
  done-count:(-> @get-count \done).property \@each.list

  actions:move:(target-list, task)->
    if target-list is \out
      task.delete-record!
      task.save!
    else
      task.set \list target-list .save!

App.NewtaskController = Em.Controller.extend do
  list:\inbox
  actions:create:->
    input = @get-properties <[title project list description dueBy]>
    record = @store.create-record \todo input
    record.save!

    @set \title ''
    @set \project ''
    @set \description ''
  
    @transition-to \index

App.EdittaskController = Em.ObjectController.extend do
  actions:save:->
    record = @get \model
    record.save!
    @transition-to \todolist record.get \list

App.Todo = DS.Model.extend do
  'title': DS.attr \string
  'description': DS.attr \string
  'project': DS.attr \string
  'list': DS.attr \string

  'showOut':(-> (@get \list) is \done).property \list
  'showNext':(-> (@get \list) isnt \next).property \list
  'showWaiting':(-> (@get \list) isnt \waiting).property \list
  'showMaybe':(-> (@get \list) isnt \maybe).property \list
  'showDone':(->
    list = @get \list
    list isnt \done and list isnt \inbox
  ).property \list

App.TabLiComponent = Em.Component.extend do
  tag-name:\li
  class-name-bindings:<[active]>
  active:(->
    @get \childViews .any-by \active
  ).property \childViews.@each.active

Em.Handlebars.helper \markdown ->
 if it
   new Em.Handlebars.SafeString marked it