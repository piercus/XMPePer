if( window['console'] == undefined ) {
    console = {
        info: Ext.emptyFn,
        log: Ext.emptyFn,
        dir: Ext.emptyFn,
        dirxml: Ext.emptyFn,
        warn: Ext.emptyFn,
        error: Ext.emptyFn
    }
}

/**
 * @fileoverview This file contains all things that make life easier when
 * dealing with JIDs
 * @author Stefan Strigler
 */

Ext.namespace( "Xmpp4Js" );

/**
 * list of forbidden chars for nodenames
 * @private
 */
var Jid_FORBIDDEN = ['"',' ','&','\'','/',':','<','>','@']; 

/**
 * Creates a new Jid object
 * @class Jid models xmpp jid objects
 * @constructor
 * @param {Object} jid jid may be either of type String or a JID represented 
 * by JSON with fields 'node', 'domain' and 'resource'
 * @throws Xmpp4Js.JidInvalidException Thrown if jid is not valid
 * @return a new Jid object
 */
Xmpp4Js.Jid = function(jid) {
  /**
   *@private
   */
  this._node = '';
  /**
   *@private
   */
  this._domain = '';
  /**
   *@private
   */
  this._resource = '';

  if (jid !== undefined && jid != null) {
	  if (jid instanceof Xmpp4Js.Jid) {
	
	    this.setNode(jid.getNode());
	    this.setDomain(jid.getDomain());
	    this.setResource(jid.getResource());
	    
	  } else {
	    if (jid.indexOf('@') != -1) {
	        this.setNode(jid.substring(0,jid.indexOf('@')));
	        jid = jid.substring(jid.indexOf('@')+1);
	    }
	    if (jid.indexOf('/') != -1) {
	      this.setResource(jid.substring(jid.indexOf('/')+1));
	      jid = jid.substring(0,jid.indexOf('/'));
	    }
	    this.setDomain(jid);
	  }
  }
}


/**
 * Gets the node part of the jid
 * @return A string representing the node name
 * @type String
 */
Xmpp4Js.Jid.prototype.getNode = function() { return this._node; };

/**
 * Gets the domain part of the jid
 * @return A string representing the domain name
 * @type String
 */
Xmpp4Js.Jid.prototype.getDomain = function() { return this._domain; };

/**
 * Gets the resource part of the jid
 * @return A string representing the resource
 * @type String
 */
Xmpp4Js.Jid.prototype.getResource = function() { return this._resource; };


/**
 * Sets the node part of the jid
 * @param {String} node Name of the node
 * @throws Xmpp4Js.JidInvalidException Thrown if node name contains invalid chars
 * @return This object
 * @type Jid
 */
Xmpp4Js.Jid.prototype.setNode = function(node) {
  Xmpp4Js.Jid._checkNodeName(node);
  this._node = node || '';
  return this;
};

/**
 * Sets the domain part of the jid
 * @param {String} domain Name of the domain
 * @throws Xmpp4Js.JidInvalidException Thrown if domain name contains invalid 
 * chars or is empty
 * @return This object
 * @type Jid
 */
Xmpp4Js.Jid.prototype.setDomain = function(domain) {
  if (!domain || domain == '')
    throw new Xmpp4Js.JidInvalidException("domain name missing");
  // chars forbidden for a node are not allowed in domain names
  // anyway, so let's check
  Xmpp4Js.Jid._checkNodeName(domain); 
  this._domain = domain;
  return this;
};

/**
 * Sets the resource part of the jid
 * @param {String} resource Name of the resource
 * @return This object
 * @type Jid
 */
Xmpp4Js.Jid.prototype.setResource = function(resource) {
  this._resource = resource || '';
  return this;
};

/**
 * The string representation of the full jid
 * @return A string representing the jid
 * @type String
 */
Xmpp4Js.Jid.prototype.toString = function() {
  var jid = '';
  if (this.getNode() && this.getNode() != '')
    jid = this.getNode() + '@';
  jid += this.getDomain(); // we always have a domain
  if (this.getResource() && this.getResource() != "")
    jid += '/' + this.getResource();
  return jid;
};

/**
 * Compare two JIDs for equality
 * @param jid {Xmpp4Js.Jid or String} The jid to compare to
 * @param withoutResource {boolean} Remove resource before comparing
 */
Xmpp4Js.Jid.prototype.equals = function( jid, withoutResource ) {
	if( !(jid instanceof Xmpp4Js.Jid) ) {
		jid = new Xmpp4Js.Jid( jid );
	}

	var isEqual = false;	
	if( withoutResource ) {
		isEqual = jid.withoutResource().toString().toLowerCase() == this.withoutResource().toString().toLowerCase();
	} else {
		isEqual = jid.toString().toLowerCase() == this.toString().toLowerCase();
	
	}
	return isEqual;
	
}

/**
 * Removes the resource part of the jid
 * @return This object
 * @type Jid
 */
Xmpp4Js.Jid.prototype.removeResource = function() {
  return this.setResource();
};


/**
 * Creates a copy of Jid and removes the resource. Unlike removeResource, 
 * does not modify original object.
 * @return This object
 * @type Jid
 */
Xmpp4Js.Jid.prototype.withoutResource = function() {
	var tmpJid = new Xmpp4Js.Jid( this );
  	return tmpJid.removeResource();
};

/**
 * Check if node name is valid
 * @private
 * @param {String} node A name for a node
 * @throws Xmpp4Js.JidInvalidException Thrown if name for node is not allowed
 */
Xmpp4Js.Jid._checkNodeName = function(nodeprep) {
    if (!nodeprep || nodeprep == '')
      return;
    for (var i=0; i< Jid_FORBIDDEN.length; i++) {
      if (nodeprep.indexOf(Jid_FORBIDDEN[i]) != -1) {
        throw new JidInvalidException("forbidden char in nodename: "+Jid_FORBIDDEN[i]);
      }
    }
};

/**
 * Creates a new Exception of type JidInvalidException
 * @class Exception to indicate invalid values for a jid
 * @constructor
 * @param {String} message The message associated with this Exception
 */
Xmpp4Js.JidInvalidException = function(message) {
  /**
   * The exceptions associated message
   * @type String
   */
  this.message = message;
  /**
   * The name of the exception
   * @type String
   */
  this.name = "JidInvalidException";
}


// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


/**
 * An improved version of Scriptaculous DomBuilder that doesn't do any mapping, and allowed you
 * to specify parent document. 
 * 
 * Namespace can be specified with xmlns attribute, but there might be a better way to do it. It
 * works for my purposes.
 * @constructor
 */
var DomBuilder = function() {}

/**
 * Create a dom node on given document with given attributes, child elements, and content.
 * @param attributes {Hash} A hash of attributes to add to the element.
 * @param childElements {Array} An array of child nodes to append to the element, in order.
 * @param content {Element|Object} Content to append. If it's not an Element, its string representation will be put into a text node. Appended as last element if other child nodes are set.
 * @param parentDoc {Document} The parent doc to create nodes on; defaults to Packet.getDocument()
 */
DomBuilder.node = function( elementName, attributes, childElements, content, parentDoc ) {
        /* TODO do we want to do this?
        if(childElements && content) {
                throw new Error( "Can not create a node with both content and child elements.");
        }
        */

        // if attributes isn't set, make it a new hash
        if(!attributes) {
                attributes = {};
        }
        // if childElements isn't set, make it a new Array
        if(!childElements) {
                childElements = [];
        }
        // if parentDoc isn't set, use the default packet document.
        if(!parentDoc) {
                parentDoc = Xmpp4Js.Packet.getDocument();
        }

        // if content is set, append it to childElements
        if(content) {
                // if content isn't an element, create a text node for it
                if( !(content instanceof DOMElement) ) {
                        content = parentDoc.createTextNode( content );	
                }

                childElements.push( content );
        }

        // create the element

        var elem;
        if( attributes["xmlns"] !== undefined ) {
                elem = parentDoc.createElementNS( attributes["xmlns"], elementName );
        } else if( elementName.indexOf(":") > -1 ) {
                var prefix = elementName.substring( 0, elementName.indexOf(":") );
                var xmlns = attributes[ "xmlns:" + prefix ];

                if( xmlns ) {
                        elem = parentDoc.createElementNS( xmlns, elementName );

                } else {
                        elem = parentDoc.createElement( elementName );
                }
        } else {
                elem = parentDoc.createElement( elementName );
        }

        // add attributes
        for( var k in attributes ) {
                try {
                    elem.setAttribute( k, attributes[k] );
                } catch(e) {
;;;                 alert( "Could not set attribute: "+k+"="+attributes[k]+". current="+elem.getAttribute(k).toString() );
                }
        }
        // add childElements
        for( var i = 0; i < childElements.length; i++ ) {
                elem.appendChild( childElements[i] );
        }

        // return newly created element
        return elem;
}

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

Ext.namespace( "Xmpp4Js.Packet" );

Xmpp4Js.Packet._document = createDocument();
Xmpp4Js.Packet.getDocument = function() {
	return Xmpp4Js.Packet._document;
}

/**
 * Default constructor that takes a node to be created from.
 * 
 * @param {Element} node
 * @constructor
 */
Xmpp4Js.Packet.Base = function( node ) {
    this.extensions = [];
	this.elem = node;	
}

Xmpp4Js.Packet.Base.prototype = {
    setId : function( id ) {
    	this.elem.setAttribute( "id", id );
    },
    getId : function() {
    	var id = this.elem.getAttribute( "id" ).toString();
    	if( !id ) {
    		id = "id" + Math.random( 0,100 );
    		this.setId( id );
    	}
    	return id;
    },
    
    /**
     * 
     * @param {String} to
     */
    setTo : function( to ) {
    	this.elem.setAttribute( "to", to );
    },
    getTo : function() {
    	return this.elem.getAttribute( "to" ).toString();
    },
    
    /**
     * 
     * @param {String} from
     */
    setFrom : function( from ) {
    	this.elem.setAttribute( "from", from );
    },
    getFrom : function() {
    	return this.elem.getAttribute( "from" ).toString();
    },
    
    /**
     * 
     * @param {Jid} to
     */
    setToJid : function( to ) {
    	this.elem.setAttribute( "to", to.toString() );
    },
    getToJid : function() {
    	return new Xmpp4Js.Jid(this.elem.getAttribute( "to" ).toString());
    },
    
    /**
     * 
     * @param {Jid} from
     */
    setFromJid : function( from ) {
    	this.elem.setAttribute( "from", from.toString()  );
    },
    getFromJid : function() {
    	return new Xmpp4Js.Jid(this.elem.getAttribute( "from" ).toString());
    },
    
    
    
    setType : function( type ) {
    	this.elem.setAttribute( "type", type );
    },
    getType : function() {
    	return this.elem.getAttribute( "type" ).toString();
    },
    
    setNode : function(node) {
    	this.elem = node;
    },
    getNode : function() {
    	return this.elem;
    },
    
    getDoc : function() {
    	return this.elem.ownerDocument;
    },
    
    toString : function() {
    	var string = "Packet ["
    		+ "node (JSON)=" 
    		+ ", type=" + this.getType()
    		+ ", from=" + this.getFrom()
    		+ ", to=" + this.getTo()
    		+ ", toJid=" //+ this.getToJid().toString()
    		+ "]";
    	return string;
    },
    
    
    /**
     * Set text content or a node to a child element. 
     * Creates the element if it doesn't exist. 
     * FIXME if content is a node, it does not replace existing
     *       content by removing node of same name.
     */
    setChildElementContent : function( elemName, content ) {
        var childNode = this.getChildElementNode(elemName);
        if( !childNode ) {
            childNode = DomBuilder.node( elemName );
            childNode = this.elem.appendChild( childNode );
        }
        if( content instanceof DOMElement ) {
            var importedContent = this.elem.ownerDocument.importNode( content, true );
            childNode.appendChild( importedContent );
        } else {
            childNode.setTextContent( content );
        }
        
    },
    
    /**
     * Get a child element node if it exists.
     */
    getChildElementNode : function(elemName) {
        return this.elem.getElementsByTagName(elemName).item(0);
    },
    
    /**
     * Get the text content of a node.
     */
    getChildElementContent : function(elemName, defaultVal) {
        var node = this.getChildElementNode(elemName);
        var content = null;
        
        if( node ) {
            content = node.getStringValue();
        }
        
        if( content == null || content == "" ) {
            content = defaultVal;
        }
        
        return content;
    },
    
    /**
     * Removes a child element of given name.
     */
    removeChildElement : function( elemName ) {
        var node = this.getChildElementNode(elemName);
        node.parentNode.removeChild( node );
    },
    
    /**
     * There can only be one extension per namespace. Removes an existing 
     * extension of same namespace if there is one, and adds the new one.
     */
    addExtension : function( extension ) {
        if( this.getExtension( extension.getElementNS() ) ) {
            this.removeExtension( extension.getElementNS() );
        }
        
        this.extensions[ extension.getElementNS() ] = extension;
    },
    
    removeExtension : function( extensionNS ) {
        //if( this.extensions[ extensionNS ] ) {
            this.extensions[ extensionNS ].removeNode();
            delete this.extensions[ extensionNS ];
        //} else {
            // throw error?
        //}
    },
    
    getExtensions : function() {
        var extensions = [];
        for( var k in this.extensions ) {
            var ext = this.extensions[k];
            
            if( ext instanceof Xmpp4Js.Ext.PacketExtension ) {
                extensions.push( ext );
            }
        }
        
        return extensions;
    },
    
    getExtension : function(extensionNS) {
        return this.extensions[ extensionNS ];
    },
    
    /**
     * FIXME If there are multiple with the same namespace, there will be trouble.
     */
    loadExtensions : function(provider) {
        var extensions = provider.readAll( this );
        
        for( var i = 0; i < extensions.length; i++ ) {
            var ext = extensions[i];
            
            
            
            this.addExtension( ext );
        }
    }

};

/** @deprecated */
function createDocument() {
    return new DOMDocument(new DOMImplementation()); 
}

/** @deprecated */
function serializeNode(node) {
    return node.toString();
}

/** @deprecated */
function parseXmlToDoc(xml) {
    return (new DOMImplementation()).loadXML(xml);
}





Ext.namespace( "Xmpp4Js.Packet" );

/**
 * Constructs an IQ packet if the PacketBase constructor doesn't
 * handle it.
 * 
 * @constructor
 * @extends Xmpp4Js.Packet.Base
 * @param {String} to
 * @param {String} type
 * @param {String} queryNS
 */
Xmpp4Js.Packet.IQ = function( to, type, queryNS ) {

    var doc = Xmpp4Js.Packet.getDocument();
    
    var node = doc.createElement( "iq" );
    Xmpp4Js.Packet.IQ.superclass.constructor.call( this, node );
    
    if( to ) { this.setTo( to ); }
    if( type ) { this.setType( type ); }
    if( queryNS ) {
        var query =  this.getNode().appendChild( doc.createElement( "query" ) );
        query.setAttribute( "xmlns",  queryNS );
    }
}

Xmpp4Js.Packet.IQ.prototype = {
    
    setQuery : function( elem ) {
        // TODO check elem
        this.elem.appendChild( elem );
    },
    getQuery : function() {
        var elem = this.elem.getElementsByTagName("query").item(0);
        return elem;
    },
    
    /** @deprecated */
    getQueryXMLNS : function() {
        var query = this.getQuery();
        return query ? query.getAttribute("xmlns").toString() : "";
    }
}

Ext.extend( Xmpp4Js.Packet.IQ, Xmpp4Js.Packet.Base, Xmpp4Js.Packet.IQ.prototype);

Ext.namespace( "Xmpp4Js.Packet" );

/**
 * Constructs a Presence packet if the Packet.Base constructor doesn't
 * handle it.
 * 
 * @constructor
 * @extends Xmpp4Js.Packet.Base
 * @param {Object} to
 * @param {Object} type
 * @param {Object} body
 */
Xmpp4Js.Packet.Message = function( to, type, body, subject ) {
    var doc = Xmpp4Js.Packet.getDocument();
    
    var node = doc.createElement( "message" );
    Xmpp4Js.Packet.Message.superclass.constructor.call( this, node );

    if( to ) { this.setTo( to ); }
    if( type ) { this.setType( type ); }
    if( body != null ) { this.setBody( body ); }
    if( subject != null ) { this.setSubject( subject ); }
}

Xmpp4Js.Packet.Message.prototype = {
    /**
     * 
     * @param {Object} Element or string containing body content.
     */
    setBody : function( content ) {
        this.setChildElementContent( "body", content );
        
    },
    getBodyNode : function() {
        return this.getChildElementNode("body");
    },
    getBody : function() {
        return this.getChildElementContent("body");
    },
    
    /**
     * 
     * @param {String} subject
     */
    setSubject : function( content ) {
        this.setChildElementContent( "subject", content );
    },
    getSubjectNode : function() {
        return this.getChildElementNode("subject");
    },
    getSubject : function() {
        return this.getChildElementContent("subject");
    },
    
    
    /**
     * 
     * @param {String} subject
     */
    setThread : function( content ) {
        this.setChildElementContent( "thread", content );
        
    },
    getThreadNode : function() {
        return this.getChildElementNode("thread");
    },
    getThread : function() {
        return this.getChildElementContent("thread");
    },
    
    hasContent : function() {
        var messageText = this.getBody();
        return messageText != null && messageText != undefined;
    }
}

Ext.extend( Xmpp4Js.Packet.Message, Xmpp4Js.Packet.Base, Xmpp4Js.Packet.Message.prototype);
Ext.namespace( "Xmpp4Js.Packet" );

/**
 * Constructs a Presence packet if the Xmpp4Js.Packet.Base constructor doesn't
 * handle it.
 * 
 * @constructor
 * @extends Xmpp4Js.Packet.Base
 * @param {Object} type
 */
Xmpp4Js.Packet.Presence = function( type, to, status, show, priority ) {
    var doc = Xmpp4Js.Packet.getDocument();
    
    var node = doc.createElement( "presence" );
    Xmpp4Js.Packet.Presence.superclass.constructor.call( this, node )
    
    if( to ) { this.setTo( to ); }
    if( type ) { this.setType( type ); }
    this.setPresence( show, status, priority );
}

Xmpp4Js.Packet.Presence.prototype = {
    
    getType : function() {
    	var type = this.elem.getAttribute( "type" ).toString();
        return type ? type : "available";
    },
    
    /**
     * 
     * @param {String} status
     */
    setStatus : function( content ) {
        this.setChildElementContent( "status", content );
    },
    
    getStatus : function() {
        return this.getChildElementContent( "status" );
    },
    
    /**
     * 
     * @param {String} show
     */
    setShow : function( content ) {
        this.setChildElementContent( "show", content );
    },
    
    getShow : function() {
        return this.getChildElementContent( "show", "normal" );
    },
    
    setPriority : function( content ) {
        this.setChildElementContent( "priority", content );
    },
    
    getPriority : function() {
        return this.getChildElementContent( "priority", "5" );
    },
    
    /**
     * Legacy from JSJaC
     * @param {String} show
     * @param {String} status
     * @param {String} priority
     * @deprecated
     */
    setPresence : function( show, status, priority ) {
        if( show != null ) { this.setShow(show); }
        if( status != null ) { this.setStatus(status); }
        if( priority != null ) { this.setPriority(priority); }
    }
}

Ext.extend( Xmpp4Js.Packet.Presence, Xmpp4Js.Packet.Base, Xmpp4Js.Packet.Presence.prototype);

Ext.namespace( "Xmpp4Js.Packet" );

/**
 * Constructs a Presence packet if the Packet.Base constructor doesn't
 * handle it.
 * 
 * @param {Object} username
 * @param {Object} password
 * @param {Object} resource
 * @constructor
 * @extends Xmpp4Js.Packet.IQ
 */
Xmpp4Js.Packet.AuthPlainText = function( username, password, resource ) {
    var doc = Xmpp4Js.Packet.getDocument();
    
    Xmpp4Js.Packet.AuthPlainText.superclass.constructor.call( this, null, "set", "jabber:iq:auth" );
    
    var query = this.getQuery();
    // FIXME see if Prototype can make this easier...
    query.appendChild( doc.createElement( "username" ) ).appendChild( doc.createTextNode(username) );
    query.appendChild( doc.createElement( "password" ) ).appendChild( doc.createTextNode(password) );
    query.appendChild( doc.createElement( "resource" ) ).appendChild( doc.createTextNode(resource) );
    query.appendChild( doc.createElement( "plaintext" ) );
}

Xmpp4Js.Packet.AuthPlainText.prototype = {
    /**
     * @deprecated see Xmpp4Js.Workflow.Login
     */
    send : function( con ) {
        this.setTo( con.domain );
        con.send( this, function( responseIq ) {
            if( responseIq.getType() == 'error' ) {
                con.fireEvent( "autherror" );
            } else { 
                //alert( "plaintext auth succes with packet, evens" );
                con.jid = responseIq.getTo();
                // FIXME this is legacy for JSJaC... onconnect should happen on connect
                con.fireEvent( "onconnect" );
                con.fireEvent( "onauth" );
            }
        } );
    }
}

Ext.extend( Xmpp4Js.Packet.AuthPlainText, Xmpp4Js.Packet.IQ, Xmpp4Js.Packet.AuthPlainText.prototype);
Ext.namespace( "Xmpp4Js.Ext" );

/**
 * Add an extension to a packet. It is currently unique per extension namespace
 * and has an extension instance bound to a packet instance, specifically because
 * of how the chat states extension is specified. The element name can change,
 * and thus it isn't predictable what the element name will be when it's time
 * to parse.
 * @constructor
 */
Xmpp4Js.Ext.PacketExtension = function(stanza) {
    this.stanza = stanza;
}

Xmpp4Js.Ext.PacketExtension.prototype = {
    getElementName : function() {
        return "x";
    },
    getElementNS : function() {
        throw new Error( "getElementNS is not defined" );
    },
    
    getNode : function() {
        return this.elem;
    },
    
    createNode : function() {
        var doc = this.stanza.getNode().ownerDocument;
        this.elem = this.stanza.getNode().appendChild( doc.createElementNS( this.getElementNS(), this.getElementName() ) );
    },
    
    readNode : function() {
        //this.elem = stanza.getNode().getElementsByTagNameNS( this.getElementNS(), this.getElementName() )[0];
        var nodes = this.stanza.getNode().childNodes;
        for( var i = 0; i < nodes.getLength(); i++ ) {
            var child = nodes.item(i);
            if( child.namespaceURI == this.getElementNS() ) {
                this.elem = child;
                break;
            }
        }
    },
    
    /**
     * sets internal node reference and updates packet document. this is only
     * needed in cases where the root element/ns changes, such as for the
     * chat states extensions--setState requires the root element to change.
     * In a case like message event, only a child of the root element
     * changes so this isn't necessary. ||| NOT Else, it should only be called in the
     * constructor.|||
     */
    setNode : function(node) {
        
        // TODO should try block be refactored to inside removeNode?
        try {
            this.removeNode();
        } catch(e) {
            // no big deal, node hasn't been added yet.
;;;            console.info( "Couldn't remove child: " + e );
        }
        
        var stanzaNode = this.stanza.getNode();
        this.elem = stanzaNode.appendChild( node );
    },
    removeNode : function() {
        var parentNode = this.stanza.getNode();
        parentNode.removeChild( this.getNode() );
    }  
}

/**
 * @constructor
 */
Xmpp4Js.Ext.PacketExtensionProvider = function() {
    this.providers = [];
}

Xmpp4Js.Ext.PacketExtensionProvider.prototype = {
    register : function(elemNS, clazz) {
        this.providers.push( {
            ns: elemNS,
            clazz: clazz
        } );
    },
    create : function( elemNS, stanza ) {
        var clazz = this.get( elemNS );
        
        if( !clazz ) {
            throw new Error( "No class registered for NS: " + elemNS );
        }
        
        var ext = new clazz(stanza);
        var args = Array.prototype.slice.call(arguments);
        // knock the first two args off the beginning.
        args.shift();
        args.shift();
        
        ext.createNode.apply(ext, args);
        
        return ext;
    },
    read : function( elemNS, stanza ) {    
        var clazz = this.get( elemNS );
        
        if( !clazz ) {
            throw new Error( "No class registered for NS: " + elemNS );
        }
        
        var ext = new clazz(stanza);
        ext.readNode();
        
        return ext;
    },
    
    readAll : function(stanza) {
        var extensions = [];
        
        var children = stanza.getNode().childNodes;
        for( var i = 0; i < children.getLength(); i++ ) {
            var child = children.item(i);
            
            try {
                var ext = this.read( child.namespaceURI, stanza );
            
                extensions.push( ext );
            } catch(e) {
                // no such extension... no big deal.
;;;                console.log( "Error reading extension: " + e);
            }
        }
        return extensions;
    },
    get : function( elemNS ) {
        for( var j = 0; j < this.providers.length; j++ ) {
            var prov = this.providers[j];
            
            if( prov.ns == elemNS ) {
                return prov.clazz;
            }
        }
    }
};

/**
 * @constructor
 * @extends Xmpp4Js.Ext.PacketExtension
 */
Xmpp4Js.Ext.ChatStates = function(stanza) {
    Xmpp4Js.Ext.ChatStates.superclass.constructor.call( this, stanza );
}

Xmpp4Js.Ext.ChatStates.XMLNS = "http://jabber.org/protocol/chatstates";

Xmpp4Js.Ext.ChatStates.prototype = {
    getElementNS : function() {
        return Xmpp4Js.Ext.ChatStates.XMLNS;
    },
    getElementName : function() {
        return this.state;
    },
    
    setState : function(state) {
        this.state = state;
        
        // add the new state
        var doc = this.getNode().ownerDocument;
        var node = doc.createElementNS( this.getElementNS(), this.getElementName() );

        this.setNode( node );
        
        
    },
    
    getState : function() {
        return this.state;
    },
    
    readNode : function() {
        Xmpp4Js.Ext.ChatStates.superclass.readNode.call( this );
        
        this.state = this.getNode().nodeName;
    },
    createNode : function(state) {
        // since getElementName returns this.state, and createNode creates
        // a node of name this.getElementName, we must provide state right now.
        if( !state ) {
            throw new Error( "state must be provided" );
        }
        
        this.state = state;
        Xmpp4Js.Ext.ChatStates.superclass.createNode.call(this);
        
        /*if( state ) {
            this.setState(state);
        }*/
    }
    
};

Ext.extend( Xmpp4Js.Ext.ChatStates, Xmpp4Js.Ext.PacketExtension, Xmpp4Js.Ext.ChatStates.prototype);

/**
 * @constructor
 * @extends Xmpp4Js.Ext.PacketExtension
 */
Xmpp4Js.Ext.Error = function(stanza, code, type) {
    this.code = code;
    this.type = type;
    
    Xmpp4Js.Ext.Error.superclass.constructor.call( this, stanza );
}

Xmpp4Js.Ext.Error.XMLNS = "jabber:client";

Xmpp4Js.Ext.Error.prototype = {
    getElementNS : function() {
        return Xmpp4Js.Ext.Error.XMLNS;
    },
    getElementName : function() {
        return "error";
    },
    
    setCode : function(code) {
        this.code = code;
        
        // add the new state
        this.getNode().setAttribute( "code", this.code);
    },
    
    getCode : function() {
        return this.code;
    },
    
    setType : function(code) {
        this.type = type;
        
        // add the new state
        this.getNode().setAttribute( "type", this.type);
    },
    
    getType : function() {
        return this.type;
    },
    
    readNode : function() {
        Xmpp4Js.Ext.Error.superclass.readNode.call( this );
        
        this.code = this.getNode().getAttribute( "code").toString();
        this.type = this.getNode().getAttribute( "type").toString();
    },
    createNode : function(code, type) {
        // since getElementName returns this.state, and createNode creates
        // a node of name this.getElementName, we must provide state right now.
        if( !code ) {
            throw new Error( "code must be provided" );
        }
        
        if( !type ) {
            throw new Error( "type must be provided" );
        }
        
        this.code = code;
        this.type = type;
        Xmpp4Js.Ext.Error.superclass.createNode.call(this);
        
    }
    
}

Ext.extend( Xmpp4Js.Ext.Error, Xmpp4Js.Ext.PacketExtension, Xmpp4Js.Ext.PacketExtension.prototype);

/**
 * @constructor
 * @extends Xmpp4Js.Ext.PacketExtension
 */
Xmpp4Js.Ext.MessageEvent = function(stanza, event) {
    Xmpp4Js.Ext.MessageEvent.superclass.constructor.call( this, stanza );

    if( event ) {
        this.setEvent( event );
    }
}

Xmpp4Js.Ext.MessageEvent.XMLNS = "jabber:x:event";

Xmpp4Js.Ext.MessageEvent.EVENT_EMPTY = null;

Xmpp4Js.Ext.MessageEvent.prototype = {
    
    getElementNS : function() {
        return Xmpp4Js.Ext.MessageEvent.XMLNS;
    },
    setEvent : function(event) {
        if( this.event ) {
            // remove the current event if not null / Xmpp4Js.Ext.MessageEvent.EVENT_EMPTY
            var node = this.elem.getElementsByTagName( this.event ).item(0);
            this.getNode().removeChild( node );
        } 
        
        // add the new state
        if( event ) {
            // append a new node if not empty
            this.getNode().appendChild( this.elem.ownerDocument.createElement( event ) );
        }
        
        this.event = event;       
    },
    
    getEvent : function() {
        return this.event;
    },
    
    readNode : function() {
        Xmpp4Js.Ext.MessageEvent.superclass.readNode.call( this );
        
        // FIXME this is potentially flaky... if there are text nodes, etc.
        var eventNode = this.getNode().firstChild;
        this.event = eventNode ? eventNode.nodeName : Xmpp4Js.Ext.MessageEvent.EVENT_EMPTY;
    },
    createNode : function(event) {
        Xmpp4Js.Ext.MessageEvent.superclass.createNode.call(this);
        
        if( !event ) {
            event = Xmpp4Js.Ext.MessageEvent.EVENT_EMPTY;
        }
        this.setEvent( event );
    }
};

Ext.extend( Xmpp4Js.Ext.MessageEvent, Xmpp4Js.Ext.PacketExtension, Xmpp4Js.Ext.MessageEvent.prototype );


Ext.namespace( "Xmpp4Js" );

Xmpp4Js.PacketListenerManager = function(config) {
    this.listeners = [];
    this.stanzaProvider = config.stanzaProvider;
}

Xmpp4Js.PacketListenerManager.prototype = {
    /**
     * Add a listener for certain types of packets. All packets are
     * matched if no filter is specified.
     * @param listener {Function} A function that is called if filter matches. stanza as argument.
     * @param filter {Xmpp4Js.PacketFilter.PacketFilter} A filter instance that returns true or false. AllPacketFilter is used if unspecified.
     * @todo return a filter ID that can be used to remove it, so that the same
     * 	     function can be used with multiple filters. 
     */
    addPacketListener: function( listener, filter ) {
        if( filter === null || filter === undefined ) {
            filter = new Xmpp4Js.PacketFilter.AllPacketFilter();
        }
        var wrapper = {
            listener: listener, 
            filter: filter
        };
        this.listeners.push( wrapper );

        return wrapper;
    },
    
    /**
     * Remove a packet listener
     * @param listener {Function} The listener function (exact instance) to remove.
     */
    removePacketListener: function( listener ) {
        var removeIdx = -1;

        for( var i = 0; i < this.listeners.length; i++ ) {
            var wrapper = this.listeners[i];
            if( wrapper.listener === listener ) {
                removeIdx = i;
                break;
            }
        }

        if( removeIdx > -1 ) {
            this.listeners.splice( removeIdx, 1 );
        }
    },
    
    /**
     * Run all filters on a given packet node.
     * @param {Element} packetNode The body element to process packets on.
     */
    run: function(packetNode) {
        // get rid of whitespace
        packetNode.normalize();
        
        for( var i = 0; i < this.listeners.length; i++ ) {
            var wrapper = this.listeners[i];
            try {
                if( wrapper.filter instanceof Xmpp4Js.PacketFilter.RawPacketFilter ) {
                    if( wrapper.filter.accept(packetNode) ) {
                        wrapper.listener( packetNode );
                    }
                } else {
                    for( var j = 0; j < packetNode.childNodes.getLength(); j++ ) {
                        var node = packetNode.childNodes.item(j);

                        // if it's not a normal element ignore it
                        if( node.nodeType != 1 /* ELEMENT - are there cross-browser constants? */) {
                            continue;
                        }

                        // FIXME this seems it should be jabber:client, but server impls differ
                        if( node.namespaceURI == "http://jabber.org/protocol/httpbind" 
                            || node.namespaceURI == "jabber:client" ) {
                        
                            var stanza = this.stanzaProvider.fromNode( node );

                            if( wrapper.filter.accept(stanza) ) {
                                wrapper.listener( stanza );
                            }
                        } else {
;;;                            console.info( "unrecognized packet namespace: " + node.namespaceURI );
                        }
                    }	
                }
            } catch( e ) {
                //	alert( "Exception executing filter: " + e +"\n" + e.fileName + "(" + e.lineNumber + ")");
                //	alert( e.stack );
;;;                console.debug("error during listener");
            }
        }
    }
}

Ext.namespace( "Xmpp4Js.Packet" );

/**
 * Constructs a Registration packet given a username, password, etc.
 * 
 * @constructor
 * @extends Xmpp4Js.Packet.IQ
 */
Xmpp4Js.Packet.Registration = function( to, fields ) {
    Xmpp4Js.Packet.Registration.superclass.constructor.call( this, to, "set", "jabber:iq:register" );

	var queryNode = this.getQuery();
	
	for( var k in fields ) {
	    var child = queryNode.ownerDocument.createElement( k );
	    child.setTextContent( fields[k] );
	
	    queryNode.appendChild( child );
	}
	
	// in addition to fields, add a plaintext element
	queryNode.appendChild( queryNode.ownerDocument.createElement( "plaintext" ) );
}

Xmpp4Js.Packet.Registration.prototype = {
	// TODO a programatic way to modify fields should be built, and also
	// a way to get result if this is a result packet (registered with stanza provider).
}

Ext.extend( Xmpp4Js.Packet.Registration, Xmpp4Js.Packet.IQ, Xmpp4Js.Packet.Registration.prototype);

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

Ext.namespace( "Xmpp4Js.Packet" );

/**
 * A registry of stanza qualifiers and mappings to classes to create from elements.
 * Does not register default providers automatically; explicitly call 
 * registerDefaultProviders.
 * @constructor
 */
Xmpp4Js.Packet.StanzaProvider = function() {
	this.providers = [];
}

Xmpp4Js.Packet.StanzaProvider.prototype = {
	/**
	 * Registers a provider with a qualifier function, class, and priority.
	 * @param qualifier {Function} The function to use to qualify the packet
	 * @param clazz {Class} The class to create an instance of and setNode.
	 * @param priority {Number} The priority of the provider. Higher gets more weight.
	 */
	register: function( qualifier, clazz, priority ) {
		this.providers.push( {qualifier: qualifier, clazz: clazz, priority: priority} );
	},
	/**
	 * Uses registered providers to figure out which Stanza class to use for
	 * a given packet node. 
	 * @param stanzaNode {Element} A stanza node
	 * @return {Xmpp4Js.Packet.Base} A packet object representing the node. 
	 */
	fromNode: function( stanzaNode ) {
		if( !(stanzaNode instanceof DOMElement) ) {
			// TODO throw error or something.
			return undefined;
		}
	
		var bestProvider = undefined;
		
		for( var i = 0; i < this.providers.length; i++ ) {
			var provider = this.providers[i];

			if( provider.qualifier( stanzaNode ) 
				&& (bestProvider === undefined || provider.priority > bestProvider.priority)) {
				bestProvider = provider;
			}
		}
		if( bestProvider === undefined ) {
			throw new NoProviderError( stanzaNode );
		}
		
		var stanza = new bestProvider.clazz();
		stanza.setNode( stanzaNode );
		
		return stanza;
	},
	/**
	 * Registers a provider for all unmatched packets with priority 0,
	 * and for message, iq, and message with priority 1.
	 */
	registerDefaultProviders: function() {
		// match all packets, priority 0, and make a Packet.Base
		this.register(
			Xmpp4Js.Packet.StanzaProvider.BaseProvider,
			Xmpp4Js.Packet.Base,
			0
		);
		
		// match all packets with elem name message, priority 1, and make a Packet.Message
		this.register(
			Xmpp4Js.Packet.StanzaProvider.MessageProvider,
			Xmpp4Js.Packet.Message,
			1
		);
		// match all packets with elem name presence, priority 1, and make a Packet.Presence
		this.register(
			Xmpp4Js.Packet.StanzaProvider.PresenceProvider,
			Xmpp4Js.Packet.Presence,
			1
		);
		// match all packets with elem name iq, priority 1, and make a Packet.IQ
		this.register(
			Xmpp4Js.Packet.StanzaProvider.IQProvider,
			Xmpp4Js.Packet.IQ,
			1
		);
	}
}


Xmpp4Js.Packet.StanzaProvider.BaseProvider = function( stanzaNode ) {
	return true;
}

Xmpp4Js.Packet.StanzaProvider._ElemNameProvider = function( stanzaNode, packetType ) {
	return stanzaNode.nodeName.toLowerCase() == packetType.toLowerCase();
}

Xmpp4Js.Packet.StanzaProvider.IQProvider = function( stanzaNode ) {
	return Xmpp4Js.Packet.StanzaProvider._ElemNameProvider( stanzaNode, "iq" );
}

Xmpp4Js.Packet.StanzaProvider.PresenceProvider = function( stanzaNode ) {
	return Xmpp4Js.Packet.StanzaProvider._ElemNameProvider( stanzaNode, "presence" );
}

Xmpp4Js.Packet.StanzaProvider.MessageProvider = function( stanzaNode ) {
	return Xmpp4Js.Packet.StanzaProvider._ElemNameProvider( stanzaNode, "message" );
}

/**
 * @constructor
 * @extends Error
 */
function NoProviderError(stanzaNode) {
	this.stanzaNode = stanzaNode
}

NoProviderError.prototype = {
	getStanzaNode: function() {
		return this.stanzaNode;
	}
}

Ext.extend( NoProviderError, Error, NoProviderError.prototype );

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.



Ext.namespace( "Xmpp4Js.Packet" );


/**
 * @constructor
 */
Xmpp4Js.Packet.PacketHelper = function( doc ) {
	if( doc == null ) {
		// TODO this refers to old class...
		doc = this.createDocument();
	}
	this.doc = doc;
	//this.streamNode = this.createPacket();
} 

Xmpp4Js.Packet.PacketHelper.prototype.createDocument = function() {
	return createDocument();
}

Xmpp4Js.Packet.PacketHelper.prototype.createPacket = function() {
	var packetNode = this.doc.createElement( "body" );
	packetNode.setAttribute( "xmlns", "http://jabber.org/protocol/httpbind" );

	return packetNode;
}

Xmpp4Js.Packet.PacketHelper.prototype.createIQ = function(to, type, queryNS ) {
	return new Xmpp4Js.Packet.IQ( to, type, queryNS );
}

Xmpp4Js.Packet.PacketHelper.prototype.createMessage = function( to, type, body, subject ) {
	return new Xmpp4Js.Packet.Message( to, type, body, subject );
}

Xmpp4Js.Packet.PacketHelper.prototype.createPresence = function( to, type, status, show, priority ) {
	return new Xmpp4Js.Packet.Presence( type, to, status, show, priority );
}

Xmpp4Js.Packet.PacketHelper.prototype.createAuthPlaintext = function( username, password, resource ) {
	return new Xmpp4Js.Packet.AuthPlainText( username, password, resource );
}

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.






/**
 * Implements a key sequence as described by XEP-0124, section 15.
 * @see #_initKeys
 * @constructor
 */
function KeySequence(length) {
	this._initKeys( length );	
}

KeySequence.prototype = {
	/**
	 * Get the next key in the sequence, or throw an error if there are 
	 * none left (since keys are pre-generated).
	 * @return {String} 
	 */
	getNextKey: function() { 
		if( this._idx < 0 ) {
			// TODO throw some kind of error
			return null;
		}
		return this._keys[this._idx--]; 
	},
	
	/**
	 * Returns true if this is the last key in the sequence. A new
	 * sequence will need to be generated. This is the responsibility
	 * of the user of the class at this point.
	 */
	isLastKey: function() { 
		return (this._idx == 0); 
	},
	
	/**
	 * Returns true if this is the first key in a new sequence.
	 */
	isFirstKey: function() {
		return (this._idx == this.getSize() - 1);
	},
	
	/**
	 * Get the size of the key sequence.
	 */
	getSize: function() { 
		return this._keys.length; 
	},
	
	reset: function() {
		this._initKeys( this.getSize() );
	},

    /**
     * Initialize a list of keys to use for requests.
     */
	_initKeys: function(length) {
		this._keys = [];
		this._seed = this._createNewSeed();
		this._idx = length - 1;
	
		var prevKey = this._seed;
		for (var i = 0; i < length; i++) {
			this._keys[i] = this._hash(prevKey);
			prevKey = this._keys[i];
		}
	},

	/**
	 * Return a seed to use for generating a new sequence of keys.
	 * Currently implemented to use Math.random().
	 */
	_createNewSeed: function() {
		return Math.random();
	},
	
	/**
	 * Used to hash the value of each key. Spec says it must be sha1-hex,
	 * so that's what it used.
	 */
	_hash: function( value ) {
		return hex_sha1( value );
	}
}
// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

/**
 * @constructor
 * @deprecated Ext.util.Observable is typically used.
 */
function DelegateManager() {
	this.map = {};
}

DelegateManager.prototype = {
	/**
	 * 
	 * @param {Function} func
	 * @return id to remove with
	 */
	add: function(func) {
		var id = "delegate_"+Math.random();
		this.map[id] = func;
		
		return id;
	
	},
	remove: function(id) {
		delete this.map[id];
	},
	/**
	 * Fire each delegate method with arguments that were passed to fire
	 */
	fire: function() {
		var fireArgs = arguments;
		$H(this.map).each(function(pair) {
			try {
				pair.value.apply(pair.value,fireArgs);
			} catch(e) {
				// TODO do something
			}
		});
	},
	// TODO test... even though it hardly needs it.
	getMap: function() {
		return this.map;
	}
}

/**
 * @constructor
 * @deprecated Ext.util.Observable is typically used.
 */
function EventListenerManager() {
	this.events = {};
	/** a map of event id => eventName */
	this.listenerEvents = {};
}

EventListenerManager.prototype.add = function(event, listener) {
	var dm = this.events[event];
	if( dm === undefined ) {
		this.events[event] = new DelegateManager();
		dm = this.events[event];
	}
	
	var id = dm.add( listener );
	this.listenerEvents[ id ] = event;
	
	return id;
}

EventListenerManager.prototype.remove = function(event, id) {
	// signature is changed to only take ID
	if( arguments.length == 1 ) {
		id = event;
		event = this.listenerEvents[ id ];
	}
	var dm = this.events[event];
	if( dm === undefined ) { return; }
	
	dm.remove( id );
}

EventListenerManager.prototype.getMap = function( event ) {
	var dm = this.events[event];
	if( dm === undefined ) { return; }
	
	return dm.getMap();
	
}

EventListenerManager.prototype.fireArgs = function( event, args ) {
	var callArgs = $A(args);
	// put event onto the beginning of the arg stack
	callArgs.unshift( event );
	
	this.fire.apply( this, callArgs );
}

EventListenerManager.prototype.fire = function( event ) {
	var dm = this.events[event];
	if( dm === undefined ) { return; }
	
	
	// get passed arguments and shift the first (event) off the front 
	var args = $A(arguments);
	args.shift();
	
	dm.fire.apply( dm, args );
}
Ext.namespace( "Xmpp4Js.Transport" );

/**
 * Functionality that needs testing:
 *  write:  
 *   sid 
 *     no sid on first request
 *    always present after session has started
 *   rid
 *    always present
 *    starts random
 *    sequential
 *    rollover at int limit
 *   key
 *    present / not present if it should be
 *    first, middle, last, first (init with length 3)
 *
 *  beginSession:
 *   rid, no sid, correct attributes
 *   error if called when open
 *   event is raised
 *
 *  endSession:
 *   terminate type and correct attributes are present
 *   error if called while not open
 *   event is raised
 *
 *  send:
 *   error before beginSession or after endSession
 *   multible nodes are combined to make one request
 *   number of open requests > max open requets
 *
 *  polling:
 *   doesn't send if there is an open request
 *   doesn't send if there are items in the queue
 *   sends empty body if both are empty
 */
Xmpp4Js.Transport.BOSH = function(config) {
    
    /**
     * The domain of the server you're connecting to.
     * @private
     */
    this.domain = config.domain;
    /**
     * The hostname or IP of the server to route to. defaults to domain.
     * @private
     */
    this.server = config.server || config.domain;
    /**
     * The port to route to. defaults to 5222
     * @private
     */
    this.port = config.port || 5222;
    /**
     * The time to wait for a response from the server, in seconds. defaults to 60 and can be adjusted by server.
     * @private
     */
    this.wait = config.wait || 60;
    
    /**
     * Picked up by Observable.
     * @private
     */
    this.listeners = config.listeners;
    
    
    /**
     * This is set to true when the session creation response is 
     * received and it was successful.
     *
     * @private
     */
    this.isSessionOpen = false;
    
    /**
     * @type Ext.util.TaskRunner
     * @private
     */
    this.taskRunner = new Ext.util.TaskRunner();
    
    /**
     * @private
     */
    this.sendQueueTask = {
        scope: this,
        run: this.sendQueue,
        interval: 500
    };
    
    /**
     * @private
     */
    this.sendPollTask = {
        scope: this,
        run: this.sendPoll,
        interval: 500
    };
    
    /**
     * @private
     */
    this.queue = [];
    
    /**
     * @private
     * @type String
     */
    this.endpoint = config.endpoint;
    
    /**
     * @type Ext.data.Connection
     * @private
     */
    this.xhr = this.createXhr();
    
    /** 
     * The number of open XHR requests. Used for polling.
     * @private
     */
    this.openRequestCount = 0;
    
    /**
     * The session ID sent by the server.
     * @private
     */
    this.sid = null;
    
    /**
     * The request ID set in beginSession, and cleared in endSession
     * @private
     */
    this.rid = null;
    
    /**
     * The keysequence object
     * @private
     */
    this.keySeq = null;
    
    /**
     * The max number of requests that can be open at once, sent by the server
     * @private
     */
    this.maxRequests = null;
    
    /**
     * The max number of requests that the server will keep open, sent by the server.
     * Typically this is maxRequests - 1.
     * @private
     */
    this.hold = null;
    
    var superConfig = Ext.apply( config, {
        
    });
    
    
    this.addEvents({
        /**
         * @event recv
         * @param {DomElement} the body element of the node received.
         *
         * A packet node has been received. Typically cline code will register
         * its recv handlers in response to the sessionStarted event and remove
         * them in response to the sessionEnded and termerror events.
         */
        recv : true,
        
        
        /**
         * @event write
         * @param {DomElement} the body element of the node about to be written.
         *
         * A packet node is about to be written. It includes all frame data, but 
         * the event is fired just before the open request count is incremented.
         */
        write : true,
        
        
        /**
         * @event error
         * @param {DomElement} the body element of the node received.
         *
         * A non-terminal error has occured. Connection is not necisarily closed.
         */
        error : true,
        
        /**
         * @event termerror
         * @param {String} title
         * @param {String} message
         * @param {DomElement} the body element of the node received.
         *
         * Raised when the session is been forcibly closed due to an error. 
         * Client code should remove any recv handlers here (should we remove?)
         */
        termerror : true,
        
        /**
         * @event sessionStarted
         *
         * Raised when the session has successfully be started. Clients should
         * register recv handlers here.
         */
        beginsession : true,
        
        /**
         * @event sessionEnded
         *
         * Raised when the session has been closed (voluntarily). Client code
         * should remove any recv handlers here (should we forcibly remove all?).
         */
        endsession: true
    });
    
    Xmpp4Js.Transport.BOSH.superclass.constructor.call( this, superConfig );

}

Xmpp4Js.Transport.BOSH.prototype = {
    /**
     * Create and return an instance of EXT's conneciton object
     * @return Ext.data.Connection
     * @private
     */
    createXhr: function() {
        return new Ext.data.Connection({
            url: this.endpoint,
            method: "POST",
            // FIXME this.wait is sent by initial response. Change this timeout
            //       when this.wait is changed. For now it's always at whatever
            //       this.wait is initialized to.
            timeout: this.wait * 1000,
            disableCaching: true,
            headers: { 'content-type': 'text/xml' }
        });
    },
    
    
    /**
     * Send a session creation request, and if it is successfully responded to
     * then mark the session open and start the sendQueueTask.
     */
    beginSession: function() {
        this.rid = this.createInitialRid();
        
        var packetNode = this.createPacketNode();
        packetNode.setAttribute( "wait", this.wait );
        packetNode.setAttribute( "to", this.domain );
        packetNode.setAttribute( "route", "xmpp:" + this.server + ":" + this.port);
        packetNode.setAttribute( "ver", "1.6");
        packetNode.setAttribute( "xml:lang", "en");
        packetNode.setAttribute( "xmlns:xmpp", "urn:xmpp:xbosh");
        packetNode.setAttribute( "xmpp:version", "1.0" );
        

        this.on("recv", this.onBeginSessionResponse, this, {single:true});
  
        this.write( packetNode );
    },
    
    /** 
     * Callback to the beginSession packet (recv event).
     *
     * @param {DomElement} packetNode
     * @private
     */
    onBeginSessionResponse: function(packetNode) {
        // HACK single doesn't seem to work...
        //this.un("recv", arguments.callee /* the current function */, this );


        this.sid = packetNode.getAttribute( "sid" ).toString();
        this.maxRequests = packetNode.getAttribute( "requests" ).toString();
        
        if( packetNode.hasAttribute("hold") ) {
            this.hold = packetNode.getAttribute("hold").toString();
        } else {
            // sensible default
            this.hold = packetNode.maxRequests - 1;
        }
        
        if( packetNode.hasAttribute("wait") ) {
            // FIXME ideally xhr's timeout should be updated
            this.wait = packetNode.getAttribute("wait").toString();
        }

        this.startup();

        this.fireEvent( "beginsession" );
    },
    
    /**
     * Set isSessionOpen to true and start sendQueue and sendPoll tasks
     * @private
     */
    startup: function() {
        this.isSessionOpen = true;
        this.taskRunner.start( this.sendQueueTask );
        this.taskRunner.start( this.sendPollTask );
        
    },
    
    /**
     * Send a terminate message, mark the sesion as closed, and stop the polling task.
     */
    endSession: function() {
        var packetNode = this.createPacketNode();
        packetNode.setAttribute( "type", "terminate" );
        
        // TODO we could be civil and append any remaining packets in the queue here.
        
        this.shutdown();

        this.write( packetNode );
        
        this.fireEvent( "endsession" );
    },
    
    /**
     * Set isSessionOpen to false and stop sendQueue and sendPoll tasks
     * @private
     */
    shutdown: function() {
        this.isSessionOpen = false;
        this.taskRunner.stop( this.sendQueueTask );
        this.taskRunner.stop( this.sendPollTask );
    },
    
    /**
     * Send a packet as soon as possible. If the session is not currently open,
     * packets will queue up until it is.
     * 
     * Should it throw an error if not currently open?
     *
     * @param {DomElement} node
     */
    send: function(node) {
        this.queue.push( node );
    },
    
    /**
     * Immediately write a raw packet node to the wire. Adds frame data including
     * RID, SID and Key if they are present.
     *
     * Also increments the openRequestCount, which is then decremented in the
     * onWriteResponse method.
     *
     * A possible addition could be to add a "no headers" flag.
     *
     * @param {DomElement} packetNode
     */
    write: function(packetNode) {
        
        this.addFrameData( packetNode );
        
        var xml = packetNode.toString();

        this.fireEvent( "write", packetNode );

        this.openRequestCount++;
        
        this.xhr.request({
            xmlData: xml,
            xmlNode: packetNode, // this isn't a real option... but it's needed for testing.
            scope: this,
            callback: this.onWriteResponse
        });
    },
    
    /**
     * Handles the response to a write call.
     *
     * Decrements the openRequestCount that was incremented in write.
     * @private
     */
    onWriteResponse: function(options, success, response) {
        this.openRequestCount--;
        
        var packetNode = null;
        
        if( response.responseText != null ) {
            // 17.4 XML Stanza Conditions?
            // this condition would be true if we closed the connection
            // before a response was received
            //
            // TODO setting xhr.timeout to a higher value than wait would
            //      eliminate this issue, unless there was a network 
            //      inturruption before the server responded. figure out
            //      how to handle this. 
            
            packetNode = new DOMImplementation().loadXML( response.responseText ).documentElement;
        }
        
        /*
            TODO - 17.1
            A legacy client (or connection manager) is a client (or 
            connection manager) that did not include a 'ver' attribute 
            in its session creation request (or response). A legacy 
            client (or connection manager) will interpret (or respond 
            with) HTTP error codes according to the table below. 
            Non-legacy connection managers SHOULD NOT send HTTP error 
            codes unless they are communicating with a legacy client. 
            Upon receiving an HTTP error (400, 403, 404), a legacy 
            client or any client that is communicating with a legacy 
            connection manager MUST consider the HTTP session to be 
            null and void. A non-legacy client that is communicating 
            with a non-legacy connection manager MAY consider that the 
            session is still active.
        */
        if( response.status == -1 ) {
            // we aborted the transaction, do nothing.
        } else if( !success || response.status != 200 ) {
            // 17.2 Terminal Binding Conditions
            this.shutdown();

            var condition = null;
            if( packetNode != null ) {
                condition = packetNode.getAttribute( "condition" ).toString();
            } else if( !response.status ) {
                condition = "undefined-condition";
            } else if( response.status != 200 ){
                condition = "status."+response.status;
            } else {
                condition = "undefined-condition";
            }
            
            var title = Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.conditions[ condition ].title;
            var message = Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.conditions[ condition ].message;

            this.fireEvent( "termerror", title, message, packetNode );
        } else if( packetNode.getAttribute("type").toString() == "error" ) {
            // 17.3 Recoverable Binding Conditions

            // TODO this should attempt to resend all packets back
            //      to the one that created the error. This could be
            //        implemented by putting each sent packet into a queue
            //        and removing it upon a successful response.
            //
            //        Ideally this error event would not even be visible beyond
            //        the the BOSH transport.
            
            this.fireEvent( "error", packetNode );
        } else {
            this.fireEvent( "recv", packetNode );
        }
    },
    
    /**
     * Create an empty packet node in the httpbind namespace.
     * @private
     * @return {DomElement} a body element with the correct namespace and basic attributes
     */ 
    createPacketNode: function() {
        var packetNode = DomBuilder.node( "body", {
                xmlns: "http://jabber.org/protocol/httpbind"
            }
        );
        
        return packetNode;
    },
    
    /**
     * Write a blank node if there is no data waiting and no requests open.
     * @private
     */
    sendPoll: function() {
        if( this.openRequestCount == 0 && this.queue.length == 0 ) {
            var packetNode = this.createPacketNode();
            this.write( packetNode );
        }
    },
    
    /**
     * Pull all packets off the queue; first-in, first-out; and send them
     * within the body of a single packet. Don't send if # open requests
     * is greater than max requests.
     *
     * @private
     */
    sendQueue: function() {
        // don't send anything if there is no work to do.
        if( this.queue.length == 0 || this.openRequestCount > this.maxRequests ) {
            return;
        }
        
        var packetNode = this.createPacketNode();

        while( this.queue.length > 0 ) {
            var node = this.queue.shift();
            var importedNode = packetNode.ownerDocument.importNode( node, true );

            packetNode.appendChild( importedNode );
        }
        
        this.write( packetNode );
    },

    /**
     * Add sid attribute to a packet, if there is one.
     * @param {Element} packetNode
     * @private
     */
    addSid: function( packetNode ) {
        if( this.sid !== null ) {
            packetNode.setAttribute( "sid", this.sid );
        }
    },
    
    /**
     * Add rid attribute to a packet, if there is one.
     * @param {Element} packetNode
     * @private
     */
    addRid: function( packetNode ) {   
        if( this.rid !== null ) {
            packetNode.setAttribute( "rid", this.rid++ );
        }
    },
    
    /**
     * Add the key attribute to the request, and if needed,
     * generate a new sequence and add the newkey attribute.
     * @param {Element} packetNode
     * @private
     */
    addKey: function( packetNode ) {
        if( this.keySeq instanceof KeySequence ) {
            var keySeq = this.keySeq;
            
            var isFirstKey = keySeq.isFirstKey();
            var isLastKey = keySeq.isLastKey();
            var key = keySeq.getNextKey();
            
            // if it's the first key, use ONLY the newkey attribute.
            if( isFirstKey ) {
                packetNode.setAttribute( "newkey", key );
            } else {
                packetNode.setAttribute( "key", key );
            }
            
            // if it's the last key, reset the KeySequence and add a newkey attribute.
            if( isLastKey ) {
;;;                console.info( "Resetting KeySequence" );
                keySeq.reset();
    
                var newKey = keySeq.getNextKey();
                packetNode.setAttribute( "newkey", newKey );
            }
        }
        
    },
    
    /**
     * Add RID, SID and Key to a packet node. Calls each respective function.
     * @private
     */
    addFrameData: function(packetNode) {
        this.addRid( packetNode );
        this.addSid( packetNode );
        this.addKey( packetNode );
    },
    
    /**
     * Generate a random number to be used as the initial request ID.
     * @private
     */
    createInitialRid: function() {
        return Math.floor( Math.random() * 10000 ); 
    }
}

Ext.extend( Xmpp4Js.Transport.BOSH, Ext.util.Observable, Xmpp4Js.Transport.BOSH.prototype );

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

Ext.namespace( "Xmpp4Js.PacketFilter" );

/**
 * Base class for a packet filter. Accepts all.
 * @constructor
 */
Xmpp4Js.PacketFilter.PacketFilter = function() {}

Xmpp4Js.PacketFilter.PacketFilter.prototype = {
	accept: function(packet) {
		return true;
	}
}



/**
 * A special type of filter, makes the listener receive the DOM body element
 * rather than a packet object.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.RawPacketFilter = function() {}

Xmpp4Js.PacketFilter.RawPacketFilter.prototype = {
	accept: function(bodyElement) {
		return true;
	}
}

Ext.extend(Xmpp4Js.PacketFilter.RawPacketFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.RawPacketFilter.prototype);


/**
 * Implements functionality common to And/Or filters, and possibly others in the future.
 * @param ... list of packet filters
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.CompositeFilter = function() {
		this.filters = [];
		
		for( var i = 0; i < arguments.length; i++ ) {
			this.filters.push( arguments[i] );
		}
}
Xmpp4Js.PacketFilter.CompositeFilter.prototype = {
	accept: function(packet) {
		return false;
	}
};

Ext.extend(Xmpp4Js.PacketFilter.CompositeFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.CompositeFilter.prototype);

/**
 * Implements the logical AND operation over two or more packet 
 * filters. In other words, packets pass this filter if they pass ALL of the filters.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.CompositeFilter
 */
Xmpp4Js.PacketFilter.AndFilter = function() {
	Xmpp4Js.PacketFilter.AndFilter.superclass.constructor.apply(this, arguments);
}
Xmpp4Js.PacketFilter.AndFilter.prototype = {
	accept: function(packet) {
		var accept = true;
		for( var i = 0; i < this.filters.length; i++ ) {
			// if accept is false, filter.accept() will never run
			accept = accept && this.filters[i].accept(packet);
		}
		return accept;
	}
}

Ext.extend(Xmpp4Js.PacketFilter.AndFilter, Xmpp4Js.PacketFilter.CompositeFilter, Xmpp4Js.PacketFilter.AndFilter.prototype);

/**
 * Implements the logical OR operation over two or more packet filters. In other words, 
 * packets pass this filter if they pass ANY of the filters.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.CompositeFilter
 */
Xmpp4Js.PacketFilter.OrFilter = function() {
	Xmpp4Js.PacketFilter.OrFilter.superclass.constructor.apply(this, arguments);
}
	
Xmpp4Js.PacketFilter.OrFilter.prototype = {
	accept: function(packet) {
		var accept = false;
		for( var i = 0; i < this.filters.length; i++ ) {
			// if accept is true, filter.accept() will never run
			accept = accept || this.filters[i].accept(packet);
		}
		return accept;
	}
	
}

Ext.extend(Xmpp4Js.PacketFilter.OrFilter, Xmpp4Js.PacketFilter.CompositeFilter, Xmpp4Js.PacketFilter.OrFilter.prototype);

/**
 * Always returns true.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.AllPacketFilter = function() {
	Xmpp4Js.PacketFilter.AllPacketFilter.superclass.constructor.apply(this, arguments);
}

Xmpp4Js.PacketFilter.AllPacketFilter.prototype = {
	accept: function(packet) {
		return true;
	}
};

Ext.extend(Xmpp4Js.PacketFilter.AllPacketFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.AllPacketFilter.prototype);

/**
 * Filters for packets of a particular type. The type is given as a Class object, so example types would:
 *     * Packet.Message
 *     * Packet.IQ
 *     * Packet.Presence
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.PacketTypeFilter = function(type) {
	Xmpp4Js.PacketFilter.PacketTypeFilter.superclass.constructor.apply(this, arguments);
	
	this.type = type;
}
	
Xmpp4Js.PacketFilter.PacketTypeFilter.prototype = {
	accept: function(packet) {
		return packet instanceof (this.type);
	}
};


Ext.extend(Xmpp4Js.PacketFilter.PacketTypeFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.PacketTypeFilter.prototype);

/**
 * Filters for packets with a particular packet ID.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.PacketIdFilter = function(id) {
	Xmpp4Js.PacketFilter.PacketIdFilter.superclass.constructor.apply(this, arguments);
	
	this.id = id;
}

Xmpp4Js.PacketFilter.PacketIdFilter.prototype = {
	accept: function(packet) {
		return packet.getId() == this.id;
	}
};


Ext.extend(Xmpp4Js.PacketFilter.PacketIdFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.PacketIdFilter.prototype );

/**
 * Filters for packets with a particular packet ID.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.FromContainsFilter = function(match) {
	Xmpp4Js.PacketFilter.FromContainsFilter.superclass.constructor.apply(this, arguments);
	
	this.match = match;
}
	
	
Xmpp4Js.PacketFilter.FromContainsFilter.prototype = {
	accept: function(packet) {
		return packet.getFrom().match( this.match );
	}
};

Ext.extend(Xmpp4Js.PacketFilter.FromContainsFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.FromContainsFilter.prototype);

/**
 * Filters for IQ packets with a particular query namespace. Ensures that
 * the packet is indeed IQ as well.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.IQQueryNSFilter = function(namespace) {
	Xmpp4Js.PacketFilter.IQQueryNSFilter.superclass.constructor.apply(this, arguments);
	
    this.iqFilter = new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.IQ );
	this.namespace = namespace;
}
	
Xmpp4Js.PacketFilter.IQQueryNSFilter.prototype = {
	accept: function(packet) {
		return this.iqFilter.accept(packet) && packet.getQuery() != null && packet.getQuery().namespaceURI == this.namespace;
	}
};

Ext.extend(Xmpp4Js.PacketFilter.IQQueryNSFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.IQQueryNSFilter.prototype);

Ext.namespace( "Xmpp4Js.PacketFilter" );

/**
 * Filter for XEP-0124 17.2 Terminal Binding Conditions
 * @constructor
 * @extends Xmpp4Js.PacketFilter.RawPacketFilter
 */
Xmpp4Js.PacketFilter.TerminalErrorPacketFilter = function() {

}
/**
 * 17.2, Table 3: Terminal Binding Error Conditions
 */
Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.conditions = {
    "bad-request" : {
        title: "bad-request",
        message : "The format of an HTTP header or binding element received from the client is unacceptable (e.g., syntax error), or Script Syntax is not supported." 
    },
    "status.400" : {
        title: "bad-request",
        message : "The format of an HTTP header or binding element received from the client is unacceptable (e.g., syntax error), or Script Syntax is not supported." 
    },
    "host-gone" : {
        title: "host-gone",
        message : "The target domain specified in the 'to' attribute or the target host or port specified in the 'route' attribute is no longer serviced by the connection manager." 
    },
    "host-unknown" : {
        title: "host-unknown",
        message : "The target domain specified in the 'to' attribute or the target host or port specified in the 'route' attribute is unknown to the connection manager." 
    },
    "improper-addressing" : {
        title: "improper-addressing",
        message : "The initialization element lacks a 'to' or 'route' attribute (or the attribute has no value) but the connection manager requires one." 
    },
    "internal-server-error" : {
        title: "internal-server-error",
        message : "The connection manager has experienced an internal error that prevents it from servicing the request." 
    },
    "item-not-found" : {
        title: "item-not-found*",
        message : "(1) 'sid' is not valid, (2) 'stream' is not valid, (3) 'rid' is larger than the upper limit of the expected window, (4) connection manager is unable to resend response, (5) 'key' sequence is invalid" 
    },
    "status.404" : {
        title: "item-not-found*",
        message : "(1) 'sid' is not valid, (2) 'stream' is not valid, (3) 'rid' is larger than the upper limit of the expected window, (4) connection manager is unable to resend response, (5) 'key' sequence is invalid" 
    },
    "other-request" : {
        title: "other-request",
        message : "Another request being processed at the same time as this request caused the session to terminate." 
    },
    "policy-violation" : {
        title: "policy-violation",
        message : "The client has broken the session rules (polling too frequently, requesting too frequently, too many simultaneous requests)." 
    },
    "status.403" : {
        title: "policy-violation",
        message : "The client has broken the session rules (polling too frequently, requesting too frequently, too many simultaneous requests)." 
    },
    "remote-connection-failed" : {
        title: "remote-connection-failed",
        message : "The connection manager was unable to connect to, or unable to connect securely to, or has lost its connection to, the server." 
    },
    "remote-stream-error" : {
        title: "remote-stream-error",
        message : "Encapsulates an error in the protocol being transported." 
    },
    "see-other-uri" : {
        title: "see-other-uri",
        message : "The connection manager does not operate at this URI (e.g., the connection manager accepts only SSL or TLS connections at some https: URI rather than the http: URI requested by the client). The client may try POSTing to the URI in the content of the <uri/> child element." 
    },
    "system-shutdown" : {
        title: "system-shutdown",
        message : "The connection manager is being shut down. All active HTTP sessions are being terminated. No new sessions can be created." 
    },
    "undefined-condition" : {
        title: "undefined-condition",
        message : "The error is not one of those defined herein; the connection manager SHOULD include application-specific information in the content of the <body/> wrapper." 
    }
}

Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.prototype = {
    accept : function(bodyElement) {
        return bodyElement.getAttribute( "type" ).toString() == "terminate" && Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.conditions[ bodyElement.getAttribute("condition").toString() ] != undefined;
    }
}

Ext.extend( Xmpp4Js.PacketFilter.TerminalErrorPacketFilter, Xmpp4Js.PacketFilter.RawPacketFilter, Xmpp4Js.PacketFilter.TerminalErrorPacketFilter.prototype);

/**
 * Filter for XEP-0124 17.3 Recoverable Binding Conditions
 *
 * In any response it sends to the client, the connection manager MAY return a 
 * recoverable error by setting a 'type' attribute of the <body/> element to 
 * "error". These errors do not imply that the HTTP session is terminated.

 * If it decides to recover from the error, then the client MUST repeat the 
 * HTTP request and all the preceding HTTP requests that have not received 
 * responses. The content of these requests MUST be identical to the 
 * <body/> elements of the original requests. This allows the 
 * connection manager to recover a session after the previous 
 * request was lost due to a communication failure.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.RawPacketFilter
 */
Xmpp4Js.PacketFilter.RecoverableErrorPacketFilter = function() {

}

Xmpp4Js.PacketFilter.RecoverableErrorPacketFilter.prototype = {
    accept : function(bodyElement) {
        return bodyElement.getAttribute( "type" ).toString() == "error";
    }
}

Ext.extend( Xmpp4Js.PacketFilter.RecoverableErrorPacketFilter, Xmpp4Js.PacketFilter.RawPacketFilter, Xmpp4Js.PacketFilter.RecoverableErrorPacketFilter.prototype);

Ext.namespace( "Xmpp4Js.PacketFilter" );

/**
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.PacketFilter.ExtensionFilter = function(extensionNS) {
    Xmpp4Js.PacketFilter.ExtensionFilter.superclass.constructor.apply(this, arguments);
    
    this.extensionNS = extensionNS;
}

Xmpp4Js.PacketFilter.ExtensionFilter.prototype = {
    accept: function(packet) {
        // rather than loading extensions for all packets, we will
        // just check child element namespaces.
        var node = packet.getNode();
        
        for( var i = 0; i < node.childNodes.getLength(); i++ ) {
            if( node.childNodes.item(i).namespaceURI == this.extensionNS ) {
                return true;
            }
        }
    }
}

Ext.extend(Xmpp4Js.PacketFilter.ExtensionFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.PacketFilter.ExtensionFilter.prototype);


/**
 * Computes challenge response for md5 auth. Truth be told, I don't 
 * understand why this stuff is like this, and can't be bothered to
 * spend more than the 30 minutes I spent looking for the spec.
 *
 * Anyone who knows more about this than me, feel free to point
 * me to it, or make this more elegant. 
 *
 * Thanks to Stefan Strigler for reference impl in JSJaC.
 *
 * @author Harlan Iverson <h.iverson at gmail dot com>
 * @constructor
 */
function Md5Sasl(username, password, domain) {
    this._username = username;
    this._password = password;
    this._domain = domain;

    this.reset();
}

Md5Sasl.prototype = {

    reset: function() {
        this._nc = null;
        this._nonce = null;
        this._cnonce = null;
        this._digestUri = null;
        this._qop = "auth";
        this._charset = "utf-8";
        this._realm = null;
    },

    decodeChallenge : function(challenge) {
        return atob( challenge );
    },
    
    encodeResponse : function( response ) {
        return binb2b64(str2binb( response ));
    },

    computeChallengeResponse : function(challenge) {
        var fields = this.deserializeFields( this.decodeChallenge( challenge ) );
        
        this._nc = "00000001";
        this._nonce = fields.nonce;
        this._cnonce = this._generateCnonce();
        this._digestUri = "xmpp/" + this._domain;
        this._realm = fields.realm || this._domain;
        
        var response = this._computeResponse( false );

        var resp = {
            username: this._username,
            realm: this._realm,
            nonce: this._nonce,
            cnonce: this._cnonce,
            nc: this._nc,
            qop: this._qop,
            "digest-uri": this._digestUri,
            response: response,
            charset: this._charset
        };

        return this.encodeResponse( this.serializeFields(resp) );   
    },
    
    /**
     * Returns true if the server sent back the response that it should have,
     * false otherwise.
     */
    checkResponse : function( challenge ) {
        var fields = this.deserializeFields( this.decodeChallenge( challenge ) );
        
        var expected = this._computeResponse( true );
        return ( expected == fields.rspauth );
    },
    
    /**
     * Deserializes a="b",cd=ef,ghi="jkl", but will choke if a comma
     * is quoted. I don't know if quoted commas are possible or not,
     * and again, can't be bothered to find a spec. Feel free to yell 
     * if I'm wrong.
     */
    deserializeFields : function(fieldsStr) {
        var fields = {};
    
        var fieldRegex = /\s*([^\=]+)\=\"?([^\"\,]*)\"?\,?\s*/g;
    
        var regexRes = fieldsStr.split(fieldRegex);
        // TODO fixure out the exta whitespace matching.
        // it starts with whitespace, there is whitespace between each, and it ends in whitespace...
        // that is why it increments by 3, starts at 1 rather than 0, and ends -1.
        for( var i = 0; i < regexRes.length - 1; i+=3 ) {
            var k = regexRes[i+1];
            var v = regexRes[i+2];
            
            fields[k] = v;
        }
        
        return fields;
    },
    
    serializeFields : function(fields) {
        var ret = [];
        
        for( var k in fields ) {
            var v = fields[k];
            
            // TODO some kind of encoding on v?
            ret.push( k + '="' + v + '"' );
        }
        
        return ret.join( "," );
    },
    
    /**
     * According to JSJaC's impl, this is exacly the same except having AUTHENTICATE
     * before the outgoing challenge, and not in the incoming response. I 
     * have no idea why, but it gives expected output. 
     *
     * Expected to be called after the state is populated by computeChallengeResponse.
     */
    _computeResponse : function( isCheck ) {
        var A = [this._username, 
            this._domain, 
            this._password].join(":");
        
        var A1 = [str_md5(A), 
        this._nonce, 
        this._cnonce].join(":");
        
        var A2 = (isCheck?"":"AUTHENTICATE") + ":" + this._digestUri;
        var response = hex_md5([hex_md5(A1), this._nonce, this._nc, this._cnonce, this._qop, hex_md5(A2)].join(":"));
      
        return response;
    },
    
    _generateCnonce : function() {
        return cnonce(14);
    }
};
// TODO put this in its own maven artifact.
/* #############################################################################
   UTF-8 Decoder and Encoder
   base64 Encoder and Decoder
   written by Tobias Kieslich, justdreams
   Contact: tobias@justdreams.de                http://www.justdreams.de/
   ############################################################################# */

// returns an array of byterepresenting dezimal numbers which represent the
// plaintext in an UTF-8 encoded version. Expects a string.
// This function includes an exception management for those nasty browsers like
// NN401, which returns negative decimal numbers for chars>128. I hate it!!
// This handling is unfortunately limited to the user's charset. Anyway, it works
// in most of the cases! Special signs with an unicode>256 return numbers, which
// can not be converted to the actual unicode and so not to the valid utf-8
// representation. Anyway, this function does always return values which can not
// misinterpretd by RC4 or base64 en- or decoding, because every value is >0 and
// <255!!
// Arrays are faster and easier to handle in b64 encoding or encrypting....
function utf8t2d(t)
{
  t = t.replace(/\r\n/g,"\n");
  var d=new Array; var test=String.fromCharCode(237);
  if (test.charCodeAt(0) < 0) 
    for(var n=0; n<t.length; n++)
      {
        var c=t.charCodeAt(n);
        if (c>0)
          d[d.length]= c;
        else {
          d[d.length]= (((256+c)>>6)|192);
          d[d.length]= (((256+c)&63)|128);}
      }
  else
    for(var n=0; n<t.length; n++)
      {
        var c=t.charCodeAt(n);
        // all the signs of asci => 1byte
        if (c<128)
          d[d.length]= c;
        // all the signs between 127 and 2047 => 2byte
        else if((c>127) && (c<2048)) {
          d[d.length]= ((c>>6)|192);
          d[d.length]= ((c&63)|128);}
        // all the signs between 2048 and 66536 => 3byte
        else {
          d[d.length]= ((c>>12)|224);
          d[d.length]= (((c>>6)&63)|128);
          d[d.length]= ((c&63)|128);}
      }
  return d;
}
        
// returns plaintext from an array of bytesrepresenting dezimal numbers, which
// represent an UTF-8 encoded text; browser which does not understand unicode
// like NN401 will show "?"-signs instead
// expects an array of byterepresenting decimals; returns a string
function utf8d2t(d)
{
  var r=new Array; var i=0;
  while(i<d.length)
    {
      if (d[i]<128) {
        r[r.length]= String.fromCharCode(d[i]); i++;}
      else if((d[i]>191) && (d[i]<224)) {
        r[r.length]= String.fromCharCode(((d[i]&31)<<6) | (d[i+1]&63)); i+=2;}
      else {
        r[r.length]= String.fromCharCode(((d[i]&15)<<12) | ((d[i+1]&63)<<6) | (d[i+2]&63)); i+=3;}
    }
  return r.join("");
}

// included in <body onload="b64arrays"> it creates two arrays which makes base64
// en- and decoding faster
// this speed is noticeable especially when coding larger texts (>5k or so)
function b64arrays() {
  var b64s='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  b64 = new Array();f64 =new Array();
  for (var i=0; i<b64s.length ;i++) {
    b64[i] = b64s.charAt(i);
    f64[b64s.charAt(i)] = i;
  }
}

// creates a base64 encoded text out of an array of byerepresenting dezimals
// it is really base64 :) this makes serversided handling easier
// expects an array; returns a string
function b64d2t(d) {
  var r=new Array; var i=0; var dl=d.length;
  // this is for the padding
  if ((dl%3) == 1) {
    d[d.length] = 0; d[d.length] = 0;}
  if ((dl%3) == 2)
    d[d.length] = 0;
  // from here conversion
  while (i<d.length)
    {
      r[r.length] = b64[d[i]>>2];
      r[r.length] = b64[((d[i]&3)<<4) | (d[i+1]>>4)];
      r[r.length] = b64[((d[i+1]&15)<<2) | (d[i+2]>>6)];
      r[r.length] = b64[d[i+2]&63];
      if ((i%57)==54)
        r[r.length] = "\n";
      i+=3;
    }
  // this is again for the padding
  if ((dl%3) == 1)
    r[r.length-1] = r[r.length-2] = "=";
  if ((dl%3) == 2)
    r[r.length-1] = "=";
  // we join the array to return a textstring
  var t=r.join("");
  return t;
}

// returns array of byterepresenting numbers created of an base64 encoded text
// it is still the slowest function in this modul; I hope I can make it faster
// expects string; returns an array
function b64t2d(t) {
  var d=new Array; var i=0;
  // here we fix this CRLF sequenz created by MS-OS; arrrgh!!!
  t=t.replace(/\n|\r/g,""); t=t.replace(/=/g,"");
  while (i<t.length)
    {
      d[d.length] = (f64[t.charAt(i)]<<2) | (f64[t.charAt(i+1)]>>4);
      d[d.length] = (((f64[t.charAt(i+1)]&15)<<4) | (f64[t.charAt(i+2)]>>2));
      d[d.length] = (((f64[t.charAt(i+2)]&3)<<6) | (f64[t.charAt(i+3)]));
      i+=4;
    }
  if (t.length%4 == 2)
    d = d.slice(0, d.length-2);
  if (t.length%4 == 3)
    d = d.slice(0, d.length-1);
  return d;
}

if (typeof(atob) == 'undefined' || typeof(btoa) == 'undefined')
  b64arrays();

if (typeof(atob) == 'undefined') {
  atob = function(s) {
    return utf8d2t(b64t2d(s)); 
  }
}

if (typeof(btoa) == 'undefined') {
  btoa = function(s) { 
    return b64d2t(utf8t2d(s));
  }
}

function cnonce(size) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var cnonce = '';
  for (var i=0; i<size; i++) {
    cnonce += tab.charAt(Math.round(Math.random(new Date().getTime())*(tab.length-1)));
  }
  return cnonce;
}
Ext.namespace( "Xmpp4Js");

/**
 * <pre>var con = new Xmpp4Js.Connection({
 *     boshEndpoint: "/http-bind/"
 * });</pre>
 */
Xmpp4Js.Connection = function(config) {
    /** @private */
    this.transport = null;
    
    /**
     * Used for getInstanceFor as a substitute for hashCode, since I can't 
     * find one in JS.
     * @type String
     */
    this.id = Ext.id();
    
    this.stanzaProvider = config.stanzaProvider;
    
    this.transportConfig = config.transport;
    
    var superConfig = Ext.apply(config, {
    
    });
    
    this.addEvents({
        /**
         * The connection is open and ready for normal packets to be exchanged.
         */
        connect: true,
        /**
         * The connection was clsoed either forcibly or voluntarily. error
         * will be fired preceeding close if it was an forced termination.
         */
        close: true,
        /**
         * An error was received from the server. If the error is terminal,
         * the close event will be fired in succession
         *
         * TODO I don't like changing the order of the last three params
         *      from termerror, or that regular error doesn't have them. Then
         *      again, the goal is to not propagate recoverable error this far 
         *      anyway.
         * 
         * @param {Boolean} terminal
         * @param {DomElement} packetNode
         * @param {String} title
         * @param {String} message
         */
        error: true
    });
    
    /**
     * Picked up by Observable.
     * @private
     */
    this.listeners = config.listeners;
    
    this.domain = null;
    this.connected = false;
    this.packetHelper = new Xmpp4Js.Packet.PacketHelper();
    
    /** 
     * @private
     * @type Xmpp4Js.PacketListenerManager
     */
    this.packetListenerManager = new Xmpp4Js.PacketListenerManager({
        stanzaProvider: this.stanzaProvider
    });
    
    Xmpp4Js.Connection.superclass.constructor.call( this, superConfig );
    
}

Xmpp4Js.Connection.prototype = {
    /**
     * Connect to a given domain, port and server. Only domain is required.
     */
    connect: function(domain, port, server) {
        // TODO it would be nice to be able to give a connect
        //      event as a parameter, that registers on this and 
        //      unregisters right after it's called.
    
        if( this.isConnected() ) {
            throw new Xmpp4Js.Error( "Already Connected" );
        }
        this.domain = domain;

        var transportClass = this.transportConfig.clazz;
        
        if( typeof transportClass != 'function' ) {
            throw new Error( "transportClass is not valid." );
        }
        
        var transportConfig = Ext.apply( this.transportConfig, {
            domain: this.domain,
            port: port,
            server: server,
            listeners: {
                scope: this,
                termerror: this.onTerminalError,
                error: this.onError,
                beginsession: this.onBeginSession,
                endsession: this.onEndSession
                // recv will be added in beginSession.
            }
        });

        this.transport = new transportClass(transportConfig);
        this.transport.beginSession();
    },
    
    /**
     * Close the connection.
     */
    close: function() {
        if( !this.isConnected() ) {
            throw new Xmpp4Js.Error( "Not Connected" );
        }
        
        this.transport.endSession();
    },
    
    /**
     * Send a packet across the wire, and register a PacketIdListener if a callback
     * is supplied
     * 
     * @param {Xmpp4Js.Packet.Base} packet
     * @param {function} callback The callback to be invoked when the server sends a response with same ID.
     * @see Xmpp4Js.PacketFilter.PacketIdFilter
     */
    send: function(packet, callback) {
        if( !this.isConnected() ) {
            throw new Xmpp4Js.Error( "Not Connected" );
        }
        
        if( callback ) {
            var id = packet.getId();

            var pf = new Xmpp4Js.PacketFilter.PacketIdFilter( id );
            // TODO can this be abstracted to a OneTimePacketFilter that wraps
            //      any other PacketFilter?
            var listener = function( node ) {
                this.removePacketListener( listener );

                callback( node );
            }.bind(this);

            this.addPacketListener( listener, pf );    
        }
        
        this.transport.send( packet.getNode() );
    },
    
    /**
     * Returns whether or not er are connected.
     */
    isConnected: function() {
        return this.connected;
    },
    
    /**
     * Adds a packet listener and returns its function. See PacketReader.
     * @return Function
     * @see Xmpp4Js.PacketListenerManager#addPacketListener
     */
    addPacketListener : function( listener, filter ) {
        return this.packetListenerManager.addPacketListener( listener, filter );
    },

    /**
     * Removes a packet listener by function. See PacketReader.
     * @param {Function} listener The listener returned by addPacketListener
     * @see Xmpp4Js.PacketListenerManager#removePacketListener
     */
    removePacketListener : function( listener ) {
        return this.packetListenerManager.removePacketListener( listener );
    },
    
    /**
     * Called whenever an incoming packet comes. Handles dispatching
     * packet listeners / filters.
     *
     * @param {DomElement} packetNode
     * @private
     */
    onRecv: function(packetNode) {
        this.packetListenerManager.run( packetNode ); 
    },
    /**
     * Sets connected to false and removes the onRecv listener.
     * @private
     */
    onTerminalError: function(title, message, packetNode) {
        this.fireEvent( "error", true, packetNode, title, message );
        this.shutdown();
    },
    
    /**
     * Handle non-terminal errors
     * @param {DomElement} packetNode
     * @private
     */
    onError: function(packetNode) {
        this.fireEvent( "error", false, packetNode );
    },
    
    /**
     * Sets connected to true and sets up the onRecv listener.
     * @private
     */
    onBeginSession: function() {
        this.startup();
    },
    
    /**
     * Sets connected to false and removes the onRecv listener.
     * @private
     */
    onEndSession: function() {
        this.shutdown();
    },
    
    /**
     * Set connected to false, fire the close event, and remove the recv listener.
     * @private
     */
    shutdown: function() {
        this.transport.un("recv", this.onRecv, this );

        this.connected = false;
        this.fireEvent( "close" );
    },
       
    /**
     * Set connected to true, fire the connect event, and add the recv listener.
     * @private
     */
    startup: function() {
        this.connected = true;
        
        this.transport.on({
            scope: this,
            recv: this.onRecv
        });
        
        this.fireEvent( "connect" );
    },
    
    /**
     * @deprecated
     */
    getPacketHelper: function() {
        return this.packetHelper;
    },
    
    /**
     * Returns the Jid of the currently connected user, if any.
     * @type Xmpp4Js.Jid
     */
    getJid : function() {
        return new Xmpp4Js.Jid(this.jid);	
    }
}

Ext.extend( Xmpp4Js.Connection, Ext.util.Observable, Xmpp4Js.Connection.prototype );


Ext.namespace( "Xmpp4Js.Chat" );

/**
* @class A chat is a series of messages sent between two users. 
* Each chat has a unique thread ID, which is used to 
* track which messages are part of a particular 
* conversation. Some messages are sent without a 
* thread ID, and some clients don't send thread IDs 
* at all. Therefore, if a message without a thread 
* ID arrives it is routed to the most recently 
* created Chat with the message sender.
*
* @param {Xmpp4Js.Chat.ChatManager} chatMan
* @param {Xmpp4Js.Jid} jid
* @param {String} thread
*
* @constructor
*/
Xmpp4Js.Chat.Chat = function(chatMan, jid, thread) {
    jid = new Xmpp4Js.Jid( jid );
    
    /**
     * @type Xmpp4Js.Chat.ChatManager
     * @private
     */
    this.chatMan = chatMan;
    /**
     * @type Xmpp4Js.Jid
     * @private
     */
    this.participant = jid;
    /**
     * @type String
     * @private
     */
    this.thread = thread;
    
    this.addEvents({
        /**
        * @event messageReceived
        * Fires when a message is received.
        * @param {Xmpp4Js.Chat.Chat} chat the chat window
        * @param {Xmpp4Js.Packet.Message} message The incoming message
        */
        "messageReceived" : true,
        
        /**
        * @event messageSent
        * Fires when a message is sent.
        * @param {Xmpp4Js.Chat.Chat} chat the chat window
        * @param {Xmpp4Js.Packet.Message} message The incoming message
        */
        "messageSent" : true,

        /**
        * Fires when a chat is closed. At this point it only happens locally, with
        * a call to close(). If a new chat from the same user or with the same threadId
        * comes, it will be considered a new conversation and the chatStarted event
        * will be fired.
        */
        "close" : true
    });
}

Xmpp4Js.Chat.Chat.prototype = {
    /**
     * Send a message to the party in this message. Always to Jid and thread.
     * @param {Xmpp4Js.Packet.Message} msg
     */
    sendMessage : function( msg ) {
        if( !(msg instanceof Xmpp4Js.Packet.Message) ) {
            msg = this.createMessage( msg );
        }

        var toJid = this.getParticipant().withoutResource();

        // always set to and thread, no matter what the object says.
        msg.setToJid( toJid );
        msg.setThread( this.getThread() );

        this.chatMan.getConnection().send( msg );

        //hack
        //	this.con.stream.pw.flush();

        var messageText = msg.getBody();
        this.fireEvent("messageSent", this, msg);
    },

    /**
     * Returns the Jid of the message sender--obtained from the connection.
     * @see Xmpp4Js.JabberConnection#getJid
     * @return {Xmpp4Js.Jid}
     */
    getOutgoingJid : function() {
        return this.chatMan.getConnection().getJid();
    },

    /**
     * Creates a message associated with this chat session, including thread and to.
     * @param {String} message
     * @return Xmpp4Js.Packet.Message
     */
    createMessage : function( msg ) {
        var packetHelper = this.chatMan.getConnection().getPacketHelper();
        var msg = packetHelper.createMessage( this.participant, "chat", msg );
        msg.setThread( this.getThread() );

        return msg;
    },

    /**
     * Returns the Jid of the user the chat is with.
     * @return {Xmpp4Js.Jid} 
     */
    getParticipant : function() {
        return this.participant;
    },

    /**
     * Returns the thread ID of the current chat. Lazilly sets a thread if none exists
     * @return {String} The thread ID 
     */
    getThread : function() {
        if( !this.thread ) {
            this.thread = Math.random();
        }
        return this.thread;
    },
    
    /**
     * Closes a conversation. See ChatManager.closeChat for more info.
     * @see Xmpp4Js.Chat.ChatMan#closeChat
     */
    close : function() {
        this.chatMan.closeChat( this );
    }
};

Ext.extend(Xmpp4Js.Chat.Chat, Ext.util.Observable, Xmpp4Js.Chat.Chat.prototype);

Ext.namespace( "Xmpp4Js.Chat" );

/**
* @class Filters for message packets with a particular thread value.
* @constructor
* @param {String} thread The thread ID to filter incoming Message packets for.
*/
Xmpp4Js.Chat.MessageThreadFilter = function(thread) {
    /** @private @type String */
    this.thread = thread;
    /** A filter for Message packets 
     * @private 
     * @type Xmpp4Js.PacketFilter.PacketTypeFilter 
     */
    this.packetTypeFilter = new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.Message );
}

Xmpp4Js.Chat.MessageThreadFilter.prototype = {
    /**
     * Return true if this is a Message packet and its thread equals the one we're interested in.
     */
    accept: function(stanza) {
        return this.packetTypeFilter.accept(stanza)
        && stanza.getThread() == this.thread;
    }
}

Ext.extend( Xmpp4Js.Chat.MessageThreadFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.Chat.MessageThreadFilter.prototype );
Ext.namespace( "Xmpp4Js.Chat" );

/**
 * Automatically registers events on connection.
 * @class Manages chat conversations for a given connection.
 * @constructor
 * @param {Xmpp4Js.JabberConnection} con The connection object to associate with.
 */
Xmpp4Js.Chat.ChatManager = function(con) {
    /** @private @type Xmpp4Js.JabberConnection */
    this.con = con;
    /** @private @type Map */
    this.threads = {};
    /** An array of Chat objects. @private @type Xmpp4Js.Chat.Chat */
    this.chats = [];
    
    this.addEvents({
        /**
        * Fires when a chat has been created. Does not include the message,
        * but gives GUI managers an opportunity to setup a listener before
        * the first messageReceived is called on the chat object.
        * 
        * @event chatStarted
        * @param chat {Xmpp4Js.Chat.Chat} The chat that was created
        */
        "chatStarted" : true,
        
        
        /**
        * Fires when a chat message was received (including first).
        * It is safe to assume that chatStarted will be invoked before this.
        * 
        * @event messageReceived
        * @param {Xmpp4Js.Chat.Chat} chat the chat window
        * @param {Xmpp4Js.Packet.Message} message The incoming message
        */
        "messageReceived" : true, 
        
        /**
        * Fires when a chat is closed. At this point it only happens locally, with
        * a call to close(). If a new chat from the same user or with the same threadId
        * comes, it will be considered a new conversation and the chatStarted event
        * will be fired.
        */
        "chatClosed" : true
    });	
    
    this._registerEvents();
}

/**
 * Options able to be set.
 */
Xmpp4Js.Chat.ChatManager.prototype = {
    options : {
        /** 
         * only applies to finding chats. internally they're still stored (option may change) 
         * @type boolean
         */
        ignoreResource: false,
        /** 
         * only applies to finding chats. internally they're still stored (option may change)
         * @type boolean
         */
        ignoreThread: false
    },

    /**
     * Register a packet listener on the connection associated with this ChatManager.
     * @private
     */
    _registerEvents : function() {
        this.con.addPacketListener( function(stanza) {			
            this._handleMessageReceived( stanza );
        }.bind(this), new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.Message ));		
    },

    /**
     * Handles raising events including chatStarted and messageReceived. 
     * Only watches for normal and chat message types.
     * @param {Xmpp4Js.Packet.Message} messagePacket The message packet
     * @private
     */
    _handleMessageReceived : function( messagePacket ) {

        if( messagePacket.getType() != "normal" && messagePacket.getType() != "chat" ) {
            return;
        }

        var chat = null;
        var jid = messagePacket.getFromJid();
        var thread = messagePacket.getThread();

        try {
            chat = this.findBestChat( jid, thread );	
        } catch(e) {
            // couldn't find chat exception...
            // TODO check
            chat = this.createChat( jid, thread );
        }

        this.fireEvent( "messageReceived", chat, messagePacket );
        chat.fireEvent( "messageReceived", chat, messagePacket );
    },

    /**
     * Creates a new chat and returns it, and fires the chatStarted event.
     *
     * @param {Jid} jid
     * @param {Function} listener
     * @param (String) thread
     * @return Xmpp4Js.Chat.Chat
     */
    createChat : function (jid, thread, listener) {
        var chat = new Xmpp4Js.Chat.Chat( this, jid, thread );
        this.threads[ chat.getThread() ] = chat;
        this.chats.push( chat );

        this.fireEvent("chatStarted", chat);

        if( listener instanceof Function ) {
            chat.on( "messageReceived", listener );
        }

        return chat;
    },
    
    /**
     * Closes a given chat, and sends events. The chat will no longer be
     * available from getUserChat or getThreadChat. If a new chat from the 
     * same user or with the same threadId comes, it will be considered a 
     * new conversation and the chatStarted event will be fired.
     *
     * @param {Xmpp4Js.Chat.Chat} chat The chat object to close
     */
    closeChat : function(chat) {
        // assumes that the chat only exists once
        for( var i = 0; i < this.chats.length; i++ ) {
            if( chat == this.chats[i] ) {
                this.chats = this.chats.slice( i, i );
                break;
            }
        }
        
        delete this.threads[ chat.getThread() ];
        
        chat.fireEvent( "close", chat );
        this.fireEvent( "chatClosed", chat);
    },

    /**
     * Returns a chat by thread ID
     * @param {String} thread
     * @return Xmpp4Js.Chat.Chat
     */
    getThreadChat : function (thread) {
        return this.threads[ thread ];
    },

    /**
     * Gets a chat by Jid
     * @param {Xmpp4Js.Jid} jid Jid object or string.
     * @return Xmpp4Js.Chat.Chat
     */
    getUserChat : function (jid) {
        for( var i = 0; i < this.chats.length; i++ ) {
            var chat = this.chats[i];
            if( chat.getParticipant().equals( jid, this.options.ignoreResource ) ) {
                return chat;
            }
        }
    },

    /**
     * Get or return a Chat object using a given message.
     * This implementation checks thread -> jid (no resource) -> create.
     * @todo write test
     * @param msg {Xmpp4Js.Packet.Message} A message stanza to determine.
     * @param isOutgoing {Boolean} If true use toJid, else fromJid
     * @param ignoreResource {Boolean} Resort to ignoring the resource if needed (last attempt).
     * @return {Xmpp4Js.Chat.Chat} The end result of the chat finding.
     */
    findBestChat : function (jid, thread) {
        var chat = null;
        var forJid = new Xmpp4Js.Jid(jid);

        if( thread && !this.options.ignoreThread ) {
            chat = this.getThreadChat( thread );
        } else {
            chat = this.getUserChat( forJid );
        }

        if( chat == null ) {
;;;            console.log( "Could not find best chat for user/thread combination: " );
;;;            console.dir( arguments );

            throw new Error( "Could not find best chat for user/thread combination." );
        }

        return chat;
    },

    /**
     * Set options. 
     * FIXME Currently overwrites all existing options
     * @param {Map} options
     * @see #options
     */
    setOptions : function(options) {
        this.options = options;
    },

    /**
     * Get options associated with this ChatManager.
     * @return Map
     * @see #options
     */
    getOptions : function() {
        return this.options;
    },

    /**
     * The connection that this ChatManager is associated with.
     * @return Xmpp4Js.JabberConnection
     */
    getConnection : function() {
        return this.con;
    }
};

Xmpp4Js.Chat.ChatManager.instances = {};
Xmpp4Js.Chat.ChatManager.getInstanceFor = function(con) {
    var instances = Xmpp4Js.Chat.ChatManager.instances;
    
    if( instances[con.id] === undefined ) {
        instances[con.id] = new Xmpp4Js.Chat.ChatManager( con );
    }

    return instances[con.id];
};


Ext.extend(Xmpp4Js.Chat.ChatManager, Ext.util.Observable, Xmpp4Js.Chat.ChatManager.prototype);
Ext.namespace( "Xmpp4Js.Roster" );

/** 
 *Protected constructor should only be used by Roster
 * @constructor
 */
Xmpp4Js.Roster.RosterEntry = function(jid, alias, subscription, ask, groups, roster) {
        this.jid = jid;
        this.alias = alias;
        this.subscription = subscription;
        this.ask = ask;
        this.groups = groups;
        this.roster = roster;
}

Xmpp4Js.Roster.RosterEntry.prototype = {
	

	/** @deprecated new model doesn't keep the same entry around */
	update: function( alias, subscription, ask, groups ) {
		this.alias = alias;
		this.subscription = subscription;
		this.ask = ask;
		this.groups = groups;
	},
	/** references to all groups this entry belongs to. 0 or more. */
	getGroups: function() {
		var retGroups = [];
		// TODO possibly refactor this to roster.getGroups and make use of that... for each group, if contains this jid, add to list
		// gets groups off of con.roster
		if( this.groups.length == 0 ) {
			retGroups.push( this.roster.getUnfiledContacts() );
		} else {
			$A(this.groups).each(function(groupName) {
				var group = this.roster.getGroup(groupName);
				// if group is undefined, that means that this entry is not associated with 
				// an existing group--perhaps it was just removed.
				// TODO make a test for this case.
				if( group == undefined ) {
					group = new Xmpp4Js.Roster.VirtualRosterGroup( groupName, [this], this.roster );
				}
				retGroups.push( group );
			}.bind(this));
		}
		return retGroups;
	}

}
Ext.namespace( "Xmpp4Js.Roster" );

/** 
 *Protected constructor should only be called by Roster 
 * @constructor
 */
Xmpp4Js.Roster.RosterGroup = function(name, roster) {
      this.name = name;
      this.roster = roster;
    }
         
Xmpp4Js.Roster.RosterGroup.prototype = {
	getEntries: function() {
		var retEntries = [];
	
		$H(this.roster.map).each(function(pair) {
			var entry = pair.value;
			
			var groups = entry.groups;
			for( var j = 0; j < groups.length; j++ ) {
				var group = groups[j];
				if( group == this.name ) {
					retEntries.push( entry );
				}
			}
		}.bind(this));
		
		return retEntries;
	},
	getEntry: function(jid) {
		var entries = this.getEntries();
		var retEntry = undefined;
		$A(entries).each(function(entry) {
			if( entry.jid == jid ) {
				retEntry = entry;
			}
		}.bind(this));
		
		return retEntry;

	}
}
Ext.namespace( "Xmpp4Js.Roster" );

/**
 * A virtual group that may or may not exist in the roster
 * item manager--manages its own list of entries rather than
 * referring to live data. See RosterEntry.getGroups
 * @constructor
 * @extends Xmpp4Js.Roster.RosterGroup
 */ 
Xmpp4Js.Roster.VirtualRosterGroup = function( groupName, entries, roster) {
        Xmpp4Js.Roster.VirtualRosterGroup.superclass.constructor.call( this, groupName, roster );
        this.entries = entries;	
}

Xmpp4Js.Roster.VirtualRosterGroup.prototype = {
	getEntries: function() {
		return this.entries;
	}
}

Ext.extend( Xmpp4Js.Roster.VirtualRosterGroup, Xmpp4Js.Roster.RosterGroup, Xmpp4Js.Roster.VirtualRosterGroup.prototype);

Ext.namespace( "Xmpp4Js.Roster" );

/**
 * @constructor
 * @extends Xmpp4Js.Roster.VirtualRosterGroup
 */
Xmpp4Js.Roster.UnfiledEntriesRosterGroup = function(roster) {
        Xmpp4Js.Roster.VirtualRosterGroup.superclass.constructor.call( this, "Unfiled Contacts", [], roster );	
}
         
Xmpp4Js.Roster.UnfiledEntriesRosterGroup.prototype = {
    getEntries: function() {
        var retEntries = [];

        $H(this.roster.map).each(function(pair) {
                var entry = pair.value;
                var groups = entry.groups;

                if( !groups || groups.length == 0 ) {
                        retEntries.push( entry );
                }
        }.bind(this));

        return retEntries;
    }
}
         
Ext.extend( Xmpp4Js.Roster.UnfiledEntriesRosterGroup, Xmpp4Js.Roster.VirtualRosterGroup, Xmpp4Js.Roster.UnfiledEntriesRosterGroup.prototype);

Ext.namespace( "Xmpp4Js.Roster" );

/**
 * @constructor
 */
Xmpp4Js.Roster.RosterItemManager = function() {
    /**
     * organized by jid, including resource
     * @type Xmpp4Js.Roster.RosterEntry Array of Xmpp4Js.Roster.RosterEntry.
     */
    this.map = {};
      
    this.addEvents({
        /**
         * A new entry was added.
         * @param {Xmpp4Js.Roster.RosterEntry} newEntry
         */
        "add" : true,
        /**
         * An entry was updated.
         * @param {Xmpp4Js.Roster.RosterEntry} oldEntry
         * @param {Xmpp4Js.Roster.RosterEntry} newEntry
         */
        "update" : true,
        /**
         * An entry was removed.
         * @param {Xmpp4Js.Roster.RosterEntry} deletedEntry
         */
        "remove" : true
    });
}

Xmpp4Js.Roster.RosterItemManager.prototype = {
    /**
     * Get a roster entry by JID. Roster entries are not stored by resource, 
     * so it is always stripped to a bare JID.
     *
     * @param {String or Xmpp4Js.Jid} jid
     * @return Xmpp4Js.Roster.RosterEntry
     */
    get: function(jid) {
        jid = new Xmpp4Js.Jid(jid).withoutResource().toString();
    
        return this.map[jid];
    },
    
    /**
     * Get a roster group by name. See documentation on
     * return type for exact details.
     *
     * @param {String} name The name of the group
     * @return Xmpp4Js.Roster.RosterGroup
     */
    getGroup: function(name) {
        var groups = this.getGroups();
        for( var i = 0; i < groups.length; i++ ) {
            if( groups[i].name == name ) {
                return groups[i];
            }
        }
    },
    
    /**
     * Get an array of all groups
     *
     * @return Xmpp4Js.Roster.RosterGroup[] an array of Groups
     */
    getGroups: function() {
        var retGroups = [];
        var groupNames = {};
        
        retGroups.push( this.getUnfiledContacts() );
        
        $H(this.map).each(function(pair) {
            var entry = pair.value;
            $A(entry.groups).each(function(groupName) {
                if( groupNames[groupName] == undefined ) {
                    groupNames[ groupName ] = 1;
                    retGroups.push( new Xmpp4Js.Roster.RosterGroup( groupName, this ) );
                }
            }.bind(this));
            
        }.bind(this));
        
        return retGroups;
    },
    
    /**
     * Get the special unfiled contacts group, and all entries that
     * are not in any group.
     *
     * @return Xmpp4Js.Roster.RosterGroup
     */
    getUnfiledContacts: function(){
        return new Xmpp4Js.Roster.UnfiledEntriesRosterGroup(this);
    },
    
    /**
     * Fires events after add/modify and before delete.
     * Items are stored without taking resource into account.
     * 
     * @param {String or Xmpp4Js.Jid} jid
     * @param {String} alias
     * @param {String} subscription
     * @param {String} ask
     * @param {String Array} groups
     */
    update: function(jid, alias, subscription, ask, groups) {
        jid = new Xmpp4Js.Jid(jid).withoutResource().toString();
    
        // TODO find out if this is ever sent from the server
        if( subscription == "remove" ) {
            this.remove(jid);
            return;
        }
        var newEntry = new Xmpp4Js.Roster.RosterEntry(jid, alias, subscription, ask, groups, this);
        var currentEntry = this.map[jid];
        
        // replace current entry with new one.
        this.map[jid] = newEntry;
        
        if( currentEntry == undefined ) {
            this.fireEvent( "add", newEntry );
        } else {
            this.fireEvent( "update", currentEntry, newEntry );
        }
        
        return newEntry;
    },
    
    /**
     * Remove a contact from the roster. Fires the remove event and
     * deletes the entry from the local map.
     */
    remove: function(jid) {
        var entry = this.map[jid];

        this.fireEvent( "remove", entry );
        
        delete this.map[jid];
    },

    /**
     * Listens for regular roster packets and calls update as needed.
     *
     * FIXME This must be manually added to a connection.
     *
     * @param {Xmpp4Js.Packet.IQ} packet Could be  class of roster packet.
     */
    rosterPacketListener: function( packet ) {
        var itemNodes = packet.getQuery().getElementsByTagName("item");
        for ( var i=0; i < itemNodes.getLength(); i++ ) {
            var item = itemNodes.item(i);
    
            var jid = item.getAttribute( "jid" ).toString();
            var name = item.getAttribute( "name" ).toString();
            var subscription = item.getAttribute( "subscription" ).toString(); // none, to, from, both, remove
            var ask = item.getAttribute( "ask" ).toString(); // subscribe, unsubscribe         
    
            var groups = [];
    
            var groupNodes = item.getElementsByTagName("group");
            for( var j = 0; j < groupNodes.getLength(); j++ ) {
                var node = groupNodes.item(j);
                groups.push( node.getStringValue() );
            }

            this.update( jid, name, subscription, ask, groups );
        }
        
    },

    /**
     * Listens for roster information from legacy services. That is, 
     * these items exist on a transport's legacy roster but not necessarily 
     * in this account's native jabber roster. Calls update as needed.
     *
     * FIXME This must be manually added to a connection.
     *
     *
     * See this document: http://delx.net.au/projects/pymsnt/jep/roster-subsync/
     *
     * @param {Xmpp4Js.Packet.IQ} packet Could be  class of roster packet.
     */
    rosterSubSyncPacketListener: function( presence ) {
        var subsyncNode = presence.getNode().getElementsByTagNameNS("http://jabber.org/protocol/roster-subsync", "x").item(0);
        // TODO create a subsync packet filter.
        if( !subsyncNode ) {
            return;
        }
        
        // in subsync the JID is on the presence element, and not the item element.
        var jid = presence.getFrom();
        
        var itemNodes = subsyncNode.getElementsByTagName("item");
            
        for ( var i=0; i < itemNodes.getLength(); i++ ) {
            var item = itemNodes.item(i);
    
            var name = item.getAttribute( "name" ).toString();
            var subscription = item.getAttribute( "subscription" ).toString(); // none, to, from, both, remove
            var ask = item.getAttribute( "ask" ).toString(); // subscribe, unsubscribe         
    
            var groups = [];
    
            var groupNodes = item.getElementsByTagName("group");
            for( var j = 0; j < groupNodes.getLength(); j++ ) {
                var node = groupNodes.item(j);
                groups.push( node.getStringValue() );
            }

            this.update( jid, name, subscription, ask, groups );
        }
    }
}

Ext.extend( Xmpp4Js.Roster.RosterItemManager, Ext.util.Observable, Xmpp4Js.Roster.RosterItemManager.prototype);

Ext.namespace( "Xmpp4Js.Roster" );

/**
 * @constructor
 */
Xmpp4Js.Roster.PresenceManager = function() {
    /**
     * Map by jid => resource
     */
    this.map = {};
    /**
     * Map by jid
     */
    this.best = {};
    
    this.getBestImpl = new Xmpp4Js.Roster.PresenceManager.GetBestImpl();

    this.addEvents({
        update: true
    });
    
}

Xmpp4Js.Roster.PresenceManager.prototype = {

    /**
     * Set presence based on jid and resource, and clear best presence cache.
     * 
     * @param {Xmpp4Js.Packet.Presence} newPresence
     */
    update: function(newPresence) {
        var jid = newPresence.getFromJid().withoutResource().toString();
        var resource = newPresence.getFromJid().getResource();
        
        var type = newPresence.getType();
        
        if(type != "available" && type != "unavailable") {
            throw new Error("Invalid prsence type: " + type);
        }
        
        // If a map entry for JID doesn't exist, create it.
        if(this.map[jid]==undefined) { this.map[jid] = {}; }

        // update the new presence
        this.map[jid][resource] = newPresence;
        
        // fire the update event.
        this.fireEvent( "update", newPresence );
        
        delete this.best[jid];
    },
    /**
     * Get the presnce of a JID with a specific resource. Calls
     * getBest is resource is null.
     *
     * @return Xmpp4Js.Packet.Presence
     */
    get: function( jid, resource) {
        if( !resource ) {
            // find "best"
            return this.getBest(jid);
        }
        
        return this.map[jid] ? this.map[jid][resource] : undefined;
        
    },
    /**
     * Finds the presence with the "best" presence based on the algorithm 
     * implementation. In the future, it will be swappable. For now, 
     * see it.
     * 
     * @param {String} jid
     * @return Xmpp4Js.Packet.Presence
     */
    getBest: function( jid ) {
        var presenceList = this.map[jid];
        
        this.best[jid] = this.getBestImpl.getBest( presenceList );
        return this.best[jid];
    },
    
    /**
     * Remove a jid/resource combo. If resource is empty, all resources are removed.
     * @param {String} jid
     * @param {String} resource
     */
    remove: function(jid, resource) {
        if( this.map[jid] == undefined ) { return; }
    
        if( !resource ) {
            $H(this.map[jid]).each(function(pair) {
                var resource = pair.value;
                this.remove( jid, resource);
            }.bind(this));
            delete this.map[jid];
        } else {
            if( this.map[jid][resource] == undefined ) { return; }
            
            this.fireEvent( "remove", this.map[jid][resource] );
            delete this.map[jid][resource]; 
        }
    },
    /**
     * Listen to presence packets
     * @param {Packet} packet
     * 
     * TODO ability to gracefully handle non-presence packets
     */
    presencePacketListener: function ( packet ) {
        
        try {
            this.update( packet );
        } catch(e) {
            // a presence type that we don't care about (subscribe, unsubscribe, etc)
        }
    }
}

Ext.extend(Xmpp4Js.Roster.PresenceManager, Ext.util.Observable, Xmpp4Js.Roster.PresenceManager.prototype);



/**
 * @constructor
 */
Xmpp4Js.Roster.PresenceManager.GetBestImpl  = function() {

}

Xmpp4Js.Roster.PresenceManager.GetBestImpl.prototype = {

    SHOW_WEIGHT: {
        chat: 6,
        normal: 5,
        away: 4,
        xa: 3,
        dnd: 2 // always higher than unavailable
    },
    TYPE_WEIGHT: {
        available: 5,
        unavailable: 1
    },

    /**
     * Finds the presence with the "best" presence based on availability followed by 
     * show followed by priority. Sets cache.
     * 
     * @param {String} jid
     * @return Xmpp4Js.Packet.Presence
     */
    getBest: function( presenceList ) {
        var bestPresence = undefined;
        var bestWeight = 0;
        
        $H(presenceList).each(function(pair) {
            var presence = pair.value;
            
            // these return default values if empty.
            var show = presence.getShow();
            var type = presence.getType();
            var priority = presence.getPriority();

            // calculate the weight of the presence for getBest
            var weight = this.SHOW_WEIGHT[show] * this.TYPE_WEIGHT[type] * priority;
            
            //console.info( [show, type, priority]);
            //console.info( weight+" > "+bestWeight+"="+(weight > bestWeight) );
            
            // use the weight determined in .update()
            if( bestPresence == null || weight > bestWeight ) {
                bestPresence = presence;
                bestWeight = weight;
            }
        }.bind(this));
        
        return bestPresence;
    }
}

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


Ext.namespace( "Xmpp4Js.Roster" );

/**
 * @constructor
 */
Xmpp4Js.Roster.Roster = function( con ) {    
    this.presenceManager = new Xmpp4Js.Roster.PresenceManager();
    this.rosterItemManager = new Xmpp4Js.Roster.RosterItemManager(this);

    this.con = con;

    
    this.con.addPacketListener( this.rosterItemManager.rosterPacketListener.bind(this.rosterItemManager), new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.RosterPacket ) );
    this.con.addPacketListener( this.rosterItemManager.rosterSubSyncPacketListener.bind(this.rosterItemManager), new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.Presence ) );
    
    this.con.addPacketListener( this.presenceManager.presencePacketListener.bind(this.presenceManager), new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.Presence ) );
    

}

Xmpp4Js.Roster.Roster.prototype = {
    reload: function() {
        var iq = this.con.getPacketHelper().createIQ( null, "get", "jabber:iq:roster" );
        
        this.con.send( iq );    
    },
    
    /**
     * @param {String or Xmpp4Js.Jid} jid
     * @return Xmpp4Js.Roster.RosterEntry
     */
    getEntry: function( jid ) {
        return this.rosterItemManager.get( jid );
    },
    
    /**
     * @param {String} name
     * @return Xmpp4Js.Roster.RosterGroup
     */
    getGroup: function( name ) {
        return this.rosterItemManager.getGroup(name);
    },
    
    /**
     * @return Xmpp4Js.Roster.RosterGroup an array of roster groups
     */
    getGroups: function() {
        return this.rosterItemManager.getGroups();
    },
    
    /**
     * @return Xmpp4Js.Roster.RosterGroup
     */
    getUnfiledEntries: function() {
        return this.rosterItemManager.getUnfiledContacts();
    },

    /**
     * Creates an entry in roster under given groups,
     * and sends a subscription request to jid upon
     * success. Note: this function as asynchronous.
     *
     * @param {String} jid The jid of the person to add
     * @param {String} alias The alias (display name) of the person to add
     * @param {Array} groups an optional array of strings, group names
     */
    add: function( jid, alias, groups ) {
    
        var packet = new Xmpp4Js.Packet.RosterPacket();
        packet.addItem( jid, alias, groups );

        // TODO should this time out?
        this.con.send( packet, function(responsePacket) {
            if( responsePacket.getType() == "error" ) {
                // throw new eception: response.getError()    
            }
        
            // automatically handle sending presence requests
            // the server will ignore it if we already have
            // subscription.
            var presence = this.con.getPacketHelper().createPresence( jid, "subscribe" );
            this.con.send( presence );
        }.bind(this)); 
    },
    
    /**
     * Remove an item from the roster.
     *
     * @param {String} jid The jid of the person to remove
     */
    remove: function( jid ) {
        var packet = new Xmpp4Js.Packet.RosterPacket();
        packet.addItem( jid, null, null, "remove" );
        this.con.send( packet ); 
    },
    

    /**
     * Creates an entry in roster under given groups,
     * and sends a subscription request to jid upon
     * success. Note: this function as asynchronous.
     *
     * @param {String} jid The jid of the person to add
     * @param {String} alias The alias (display name) of the person to add
     * @param {Array} groups an optional array of strings, group names
     *
     * @deprecated use add instead.
     */
    createEntry: function( jid, alias, groups ) {
        return this.add.apply( this, arguments );
    },


    /**
     * Finds the presence with either an exact match on resource, or the "best" presence based
     * on availability followed by show followed by priority.
     * @param {String} jid
     * @param {String} resource
     * 
     * @return Xmpp4Js.Roster.PresenceManager.Presence
     */
    getPresence: function( jid, resource ) {
        return this.presenceManager.get( jid, resource );
    },
    
    getRosterItemManager: function() {
        return this.rosterItemManager;
    },
    
    getPresenceManager: function() {
        return this.presenceManager;
    },
    getConnection : function() {
        return this.con;
    }
};

Xmpp4Js.Roster.Roster.instances = {};
Xmpp4Js.Roster.Roster.getInstanceFor = function(con) {
    var instances = Xmpp4Js.Roster.Roster.instances;
    
    if( instances[con.id] === undefined ) {
        instances[con.id] = new Xmpp4Js.Roster.Roster( con );
    }

    return instances[con.id];
};


Ext.namespace( "Xmpp4Js.Packet" );

/**
 * @constructor
 * @extends Xmpp4Js.Packet.IQ
 */
Xmpp4Js.Packet.RosterPacket = function( node ) {
    Xmpp4Js.Packet.RosterPacket.superclass.constructor.call( this, null, "set", "jabber:iq:roster" );
}


Xmpp4Js.Packet.RosterPacket.prototype = {
    addItem: function( jid, alias, groups, subscription ) {
        var doc = Xmpp4Js.Packet.getDocument();
        
        this.setId( "roster_add" ); 
    
        var query = this.getQuery();
        var item = query.appendChild( doc.createElement( "item" ) );
        item.setAttribute( "xmlns", "jabber:iq:roster" );
        item.setAttribute( "jid", jid );
        
        if( subscription ) {
            item.setAttribute( "subscription", subscription );
        }
        
        if( alias ) {
            item.setAttribute( "alias", alias );
        }
        
        if( groups ) {
            for( var i = 0; i < groups.length; i++ ) {
                var group = groups[i];
                var groupNode = item.appendChild( doc.createElement( "group" ) );
                groupNode.setAttribute( "xmlns", "jabber:iq:roster" );
                groupNode.setTextContent( group );
            }   
        }
    }
}

Ext.extend( Xmpp4Js.Packet.RosterPacket, Xmpp4Js.Packet.IQ, Xmpp4Js.Packet.RosterPacket.prototype );


// TODO create a test...
function RosterPacketProvider( stanzaNode ) {
    // if it's not an IQ node, we don't care.
    if( !Xmpp4Js.Packet.StanzaProvider.IQProvider( stanzaNode ) ) {
        return false;
    }
    var queryNode = stanzaNode.getElementsByTagName("query" ).item(0);
    return queryNode != undefined && queryNode.namespaceURI == "jabber:iq:roster";
}

Ext.namespace( "Xmpp4Js.Muc" );

/**
 * Represents a participant in a conference room.
 * @constructor
 */
Xmpp4Js.Muc.MucParticipant = function(room, confJid, realJid) {
    this.room = room;
    this.confJid = confJid;
    this.realJid = realJid;
    
    this.status = [];
}

/**
 * http://www.xmpp.org/extensions/xep-0045.html#registrar-statuscodes
 */
Xmpp4Js.Muc.MucParticipant.Status = {
    VISIBLE_JID: "100",
    ENTER_ROOM: "201",
    SELF: "110",
    CHANGED_NICK: "210"
}

Xmpp4Js.Muc.MucParticipant.prototype = {
    getNick : function() {
        return this.confJid.getResource();
    },
    getRealJid : function() {
        return this.realJid;
    },
    getConfJid : function() {
        return this.confJid;
    },
    /**
     * Returns an array of status codes
     */
    getStatus : function() {
        return this.status;
    },
    
    /**
     * Returns whether the participant is self.
     */
    isSelf : function() {
        var status = this.getStatus();
        for( var k in status ) {
            var s = status[k];
            if(s == Xmpp4Js.Muc.MucParticipant.Status.SELF) { return true; }
        }
        
        return false;
    },
    
    _getMucManager : function() {
        return this.room._getMucManager();
    }
}
Ext.namespace( "Xmpp4Js.Muc" );

/**
 * Represents a conference room.
 * @constructor
 */
Xmpp4Js.Muc.MucRoom = function(mucMan, roomJid, name) {
    
    this.mucMan = mucMan;
    this.roomJid = roomJid;
    this.name = name;
}

Xmpp4Js.Muc.MucRoom.prototype = {
    getRoomJid : function() {
        return this.roomJid;
    },
    createState : function() {
        var room = new Xmpp4Js.Muc.StatefulMucRoom(this);
        return room;
    },
    _getMucManager : function() {
        return this.mucMan;
    }
}

Ext.extend( Xmpp4Js.Muc.MucRoom, Ext.util.Observable, Xmpp4Js.Muc.MucRoom.prototype);
Ext.namespace( "Xmpp4Js.Muc" );

/**
 * @constructor
 * @extends Xmpp4Js.Muc.MucRoom
 */
Xmpp4Js.Muc.StatefulMucRoom = function(mucRoom) {
    // copy properties from 'super' room
    this.mucMan = mucRoom.mucMan;
    this.roomJid = mucRoom.roomJid;
    this.name = mucRoom.name;
    
    this._myNick = null; 
    
    
    this.addEvents({
        /**
         * Some user, including self, has entered the room. see participant.isSelf.
         * @event join
         * @param {StatefulXmpp4Js.Muc.MucRoom} room
         * @param {Xmpp4Js.Muc.MucParticipant} participant
         * @param {Xmpp4Js.Packet.Message} packet
         */
        join : true,
        /**
         * There was an error of some sort, possibly a kick or ban.
         * @event join
         * @param {StatefulXmpp4Js.Muc.MucRoom} room
         * @param {Xmpp4Js.Muc.MucParticipant} participant
         * @param {Xmpp4Js.Packet.Message} packet
         */
        error : true,
        /**
         * Some user, including self, has left the room. see participant.isSelf.
         * @event part
         * @param {StatefulXmpp4Js.Muc.MucRoom} room
         * @param {Xmpp4Js.Muc.MucParticipant} participant
         * @param {Xmpp4Js.Packet.Message} packet
         */
        part : true
    });
}

Xmpp4Js.Muc.StatefulMucRoom.prototype = {
    /**
     * @param cb A function which takes MucRoom and [ Xmpp4Js.Muc.MucParticipant ] params.
     */
    getParticipants : function(cb) {
        //return [ new Xmpp4Js.Muc.MucParticipant( this, "romeo", "romeo@somewhere.com"), new Xmpp4Js.Muc.MucParticipant( this, "juliet", "julietz0r@somewhere-e;se.com") ];
        if( !this.isJoined() ) {
            throw new Xmpp4Js.Muc.MucError( "Not in a room" );
        }
    
        var discoMan = this._getMucManager()._getConnection().getServiceDisco();
        
        var self = this; 
        discoMan.discoverItems( this.roomJid, function(roomJid, items) {
            var participants = [];
            for( var i = 0; i < items.length; i++ ) {
                var item = items[i];
                
                var realJid = undefined;
                var p = new Xmpp4Js.Muc.MucParticipant( self, item.jid, realJid );
                participants.push( p );
            }
            
            cb( self, participants );
        } ); 
    },
    join : function( nick, password ) {
        if( this.isJoined() ) {
            this.part();
        }
        this._myNick = nick;
        
        var pres = this._createPresence("available");
        var mucExt = pres.getExtension( Xmpp4Js.Ext.Muc.XMLNS );
        
        if( password ) {
            mucExt.setPassword( password );
        }

        var con = this._getMucManager()._getConnection();
        
        con.send( pres, function(packet) {
            var extProvider = this._getMucManager()._getExtManager();
            packet.loadExtensions( extProvider );

            var event = "join";
            if( packet.getExtension(Xmpp4Js.Ext.Error.XMLNS) != undefined ) {
                event = "error";
            }
            this.fireEvent( event, this, /* participant */null, packet );

        }.bind(this));
    },
    /**
     * FIXME - this should use the table of participant presence
     *         to determine who the current user is (status 110).
     */
    part : function() {
        var pres = this._createPresence("unavailable");

        var con = this._getMucManager()._getConnection();
        
        con.send( pres, function(packet) {
            this.fireEvent( "part", this, /* participant */null, packet );
            this._myNick = undefined;
        }.bind(this));
    },
    sendMessage : function( msg ) {
        msg.setType( "groupchat" );
        msg.setTo( this.getRoomJid() );
        
        var con = this._getMucManager()._getConnection();
        con.send( msg );
    },
    sendText : function( text ) {
        var msg = new Xmpp4Js.Packet.Message( this.getRoomJid(), "groupchat", text );
        this.sendMessage( msg );
    },
    isJoined : function() {
        return this._myNick ? true : false;
    },
    createPrivateChat : function( toNick ) { 
    
    },
    _createPresence : function(type) {
        var nickJid = this.getRoomJid() + "/" + this._myNick;
        var pres = new Xmpp4Js.Packet.Presence( type, nickJid );
        
        var extProvider = this._getMucManager()._getExtManager();
        var mucExt = extProvider.create( Xmpp4Js.Ext.Muc.XMLNS, pres );
        
        return pres;
    }
}

Ext.extend( Xmpp4Js.Muc.StatefulMucRoom, Xmpp4Js.Muc.MucRoom, Xmpp4Js.Muc.StatefulMucRoom.prototype);
Ext.namespace( "Xmpp4Js.Muc" );

/**
 * A filter that looks for MUC presence for a given JID or all JIDs
 * @param fromJid optional, the JID to filter for. No jid captures all packets.
 * @constructor
 * @extends Xmpp4Js.PacketFilter.PacketFilter
 */
Xmpp4Js.Muc.MucPresenceFilter = function(fromJid) {
    this.fromJid = fromJid;
    
    this.presenceFilter = new Xmpp4Js.PacketFilter.PacketTypeFilter( Xmpp4Js.Packet.Presence ); 
    if(fromJid != undefined) {
        this.fromFilter = new Xmpp4Js.PacketFilter.FromContainsFilter(fromJid);
    }
}

Xmpp4Js.Muc.MucPresenceFilter.prototype = {
    accept : function(packet) {
        // if this is not a Presence packet, GTFO
        if( !this.presenceFilter.accept(packet) ) {
            return false;
        }
        
        // if we are looking only at a specific room/occupant and this packet is 
        // not from that room, then gtfo.
        if( this.fromJid != undefined && packet.getFrom().indexOf(this.fromJid) == -1 ) {
            return false;
        }
        
        // if this element contains a muc user extension
        // TODO ideally this would load real packet extensions, but...
        var elements = packet.getNode().childNodes;
        for( var i = 0; i < elements.getLength(); i++ ) {
            var elem = elements.item(i);

            // namespace matches.
            if( elem.namespaceURI == "http://jabber.org/protocol/muc#user" ) {
                return true;
            }
        }
        
        return false;
    }
}

Ext.extend( Xmpp4Js.Muc.MucPresenceFilter, Xmpp4Js.PacketFilter.PacketFilter, Xmpp4Js.Muc.MucPresenceFilter.prototype);

Ext.namespace( "Xmpp4Js.Muc" );

/**
 * Base for any muc related error
 * @constructor
 */
Xmpp4Js.Muc.MucError = function(code) {
    this.code = code
}

/**
 * MUC join error
 * @constructor
 * @extends Xmpp4Js.Muc.MucError
 */
Xmpp4Js.Muc.JoinError = function(code) {
    Xmpp4Js.Muc.JoinError.superclass.constructor.call( this, code );
}

Xmpp4Js.Muc.JoinError.prototype = {};

Ext.extend( Xmpp4Js.Muc.JoinError, Xmpp4Js.Muc.MucError, Xmpp4Js.Muc.JoinError.prototype);
Ext.namespace( "Xmpp4Js.Muc" );

/**
 * Responsible for MUC operations on a particular node
 * @constructor
 */
Xmpp4Js.Muc.MucManager = function(con, node, extProvider) {
    this.con = con;
    this.node = node;
    this.extProvider = extProvider;
    
    this.con.addPacketListener( );
    
    this.addEvents({
        /**
         * Some participant in some room was updated
         * @event participantupdated
         * @param participant {Xmpp4Js.Muc.MucParticipant}
         */
        participantupdated : true
    });
}

Xmpp4Js.Muc.MucManager.getInstanceFor = function( con, node, extProvider ) {
    if(con._mucManager == undefined) { con._mucManager = {}; }
    
    if( con._mucManager[node] == null ) {
        con._mucManager[node] = new Xmpp4Js.Muc.MucManager( con, node, extProvider );
    }
    
    return con._mucManager[node];
}

/**
 * Gets a list of nodes through service discovery that support MUC, and returns
 * them as a string array. Users con.domain if no node is specified.
 */
Xmpp4Js.Muc.MucManager.getMucNodes = function(con, node) {
    return ["conference.soashable.com"];
}

Xmpp4Js.Muc.MucManager.prototype = {
    /**
     * @param cb A function which takes [ MucRoom ] as a param.
     */
    getRoomList: function(cb) {

        var discoMan = this._getConnection().getServiceDisco();
        
        var self = this; 
        discoMan.discoverItems( this.node, function(node, items) {
            var rooms = [];
            for( var i = 0; i < items.length; i++ ) {
                var item = items[i];
                
                var room = new Xmpp4Js.Muc.MucRoom( self, item.jid, item.name );
                rooms.push( room );
            }
            
            cb( self, rooms );
        } ); 
    },
    
    getRoom : function(name) {
        var roomJid = name + "@" + this.node;
        return new Xmpp4Js.Muc.MucRoom( this, roomJid, name );
    },
    _getConnection : function() {
        return this.con;
    },
    _getExtManager : function() {
        return this.extProvider;
    }
}

Ext.extend( Xmpp4Js.Muc.MucManager, Ext.util.Observable, Xmpp4Js.Muc.MucManager.prototype);
Ext.namespace( "Xmpp4Js.Ext" );
/**
 * @constructor
 * @extends Xmpp4Js.Ext.PacketExtension
 */
Xmpp4Js.Ext.Muc = function(stanza) {
    Xmpp4Js.Ext.Muc.superclass.constructor.call( this, stanza );
}

Xmpp4Js.Ext.Muc.XMLNS = "http://jabber.org/protocol/muc";

Xmpp4Js.Ext.Muc.prototype = {
    getElementNS : function() {
        return Xmpp4Js.Ext.Muc.XMLNS;
    },
    
    setPassword : function(password) {
        throw new Error( "TODO implement" );
    }
}

Ext.extend( Xmpp4Js.Ext.Muc, Xmpp4Js.Ext.PacketExtension, Xmpp4Js.Ext.Muc.prototype);
Ext.namespace( "Xmpp4Js.Ext" );

/**
 * @constructor
 * @extends Xmpp4Js.Ext.PacketExtension
 */
Xmpp4Js.Ext.MucUser = function(stanza) {
    Xmpp4Js.Ext.MucUser.superclass.constructor.call( this, stanza );
}

Xmpp4Js.Ext.MucUser.XMLNS = "http://jabber.org/protocol/muc#user";

Xmpp4Js.Ext.MucUser.prototype = {
    getElementNS : function() {
        return Xmpp4Js.Ext.MucUser.XMLNS;
    }
}

Ext.extend( Xmpp4Js.Ext.MucUser, Xmpp4Js.Ext.PacketExtension, Xmpp4Js.Ext.MucUser.prototype);
// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.




/**
 * This class is implemented in a rather procedural way, but
 * it works for now.
 *
 * TODO this does not currently support 'result' forms with 'reported' data.
 * @constructor
 */
function DataForm() {
	this.node = null;
}

/**
 * Clones the given node and returns a reference to it
 */
DataForm.prototype.read = function(node) {
	if( node.nodeName != "x" || node.namespaceURI != "jabber:x:data" ) {
		//parentNode = node;

		alert( "nothin" );
		return; // TODO throw error
	} else if(node.getAttribute("type") == "result" && node.getElementsByTagName("reported").length > 0 ) {
		alert( "does not support 'result' forms with 'reported' elements." );
		return; // TODO throw error
	}
	
	this.node = node.cloneNode( true );
	
	return this.node;
}

/**
 * Writes to the given node. If it is jabber:x:data, it is replaced.
 * Else, jabber:x:data is appended.
 * @param node {Element} The parent node to append to.
 */
DataForm.prototype.write = function(node) {
	var newNode = this.node.cloneNode(true);
	newNode = importNode( node.ownerDocument, newNode, true );
	
	if( node.nodeName == "x" && node.namespanamespaceURI == "jabber:x:data" ) {
		var parentNode = node.parentNode;
		newNode = parentNode.replaceChild( newNode, node );
	} else {
		newNode = node.appendChild( newNode );
	}
	
	return newNode;
}

/**
 * Returna an array of field names
 */
DataForm.prototype.getFieldNames = function() {
	var fields = [];
	
	var res = this.node.getElementsByTagName("field");
	for( var i = 0; i < res.length; i++ ) {
		var field = res[i];
		fields.push( field.getAttribute("var") );
	}
	
	return fields;
}

/**
 * Returns a DOM Element for a field name. Mostly for internal
 * use, but by no means not public.
 */
DataForm.prototype.getFieldElem = function(fieldName) {
	var res = $A(this.node.getElementsByTagName("field")).findAll(function(elem){
		return elem.getAttribute("var") == fieldName;
	});
	return res.length > 0 ? res[0] : null;
}

/**
 * Set a field value, either singular or array. Will always
 * be stored/returned as an array.
 */
DataForm.prototype.setFieldValues = function(fieldName, value, saveExisting) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }
	
	if( value == null ) { value = []; }
	
	if( !(value instanceof Array) ) {
		value = [ value ];
	}
	
	if( !saveExisting ) {
		var elems = field.getElementsByTagName("value");
		for( var i = 0; i < elems.length; i++ ) {
			var valueElem = elems[i];
			valueElem.parentNode.removeChild( valueElem );
		}
	}
	
	for( var i = 0; i < value.length; i++ ) {
		var valueElem = field.ownerDocument.createElement("value");
		valueElem = field.appendChild( valueElem );
		
		valueElem.textContent = value[i];
	}
}

/**
 * Returns an array of values.
 * TODO this could be intelligent based on field type.
 */
DataForm.prototype.getFieldValues = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	var values = [];

	var elems = field.getElementsByTagName("value");
	for( var i = 0; i < elems.length; i++ ) {
		var valueElem = elems[i];
		values.push( valueElem.textContent );
	}
	
	return values;
}

/**
 * Gets the type of a given field ( as defined in XEP-0004 )-
 */
DataForm.prototype.getFieldType = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	return field.getAttribute("type");
}

/**
 * Gets the label of a field, as returned by the server
 * @todo does language need to be implemented?
 */
DataForm.prototype.getFieldLabel = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	return field.getAttribute("label");
}

/**
 * Returns the natural language description for a field
 *
 * TODO the schema allows 0 to unbounded, see if that's ever used in practice.
 */
DataForm.prototype.getFieldDescription = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	var res = field.getElementsByTagName("desc");
	return res.length > 0 ? res[0].textContent : null;
}

/**
 * Returns whether a field is required or not.
 */
DataForm.prototype.isFieldRequired = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	var res = field.getElementsByTagName("required");
	return res.length > 0;
}

/**
 * Returns an array of options for a given radio field, in an array of { label, value }
 */
DataForm.prototype.getFieldOptions = function(fieldName) {
	var field = this.getFieldElem(fieldName);
	if( field == null ) { return; }

	var options = [];

	var elems = field.getElementsByTagName("option");
	for( var i = 0; i < elems.length; i++ ) {
		var optionElem = elems[i];
		options.push( {
			label: optionElem.getAttribute("label"),
			value: optionElem.getElementsByTagName("value")[0] 
		});
	}
}

/**
 * Returns the content of the first instruction node.
 *
 * TODO the schema allows 0 to unbounded, see if that's ever used in practice.
 */
DataForm.prototype.getInstructions = function() {
	var res = this.node.getElementsByTagName("instructions");
	return res.length > 0 ? res[0].textContent : null;
}

/**
 * Returns the title of the form
 *
 * TODO the schema allows 0 to unbounded, see if that's ever used in practice.
 */
DataForm.prototype.getTitle = function() {
	var res = this.node.getElementsByTagName("title");
	return res.length > 0 ? res[0].textContent : null;
}

/**
 * Returns the type of form action.
 */
DataForm.prototype.getType = function() {
	var res = this.node.getAttribute("type");
}


/**
 * Emulates a dataform using a given mapping. Reads and writes raw elements.
 * @constructor
 * @extends DataForm
 */
function DataFormEmulator( mapping ) {
    this.mapping = mapping;

}

DataFormEmulator.prototype = {
    /**
     * Builds a dataform based on the given element and
     * mapping that was passed to the constructor.
     *
     * Returns the created node.
     *
     * @param node {Element} The parent node read from.
     */
    read : function(elem) {
        var doc = elem.ownerDocument;
        
        var newRoot = doc.createElementNS( "jabber:x:data", "x" );
        newRoot.setAttribute( "type", "form" );

        for( var elemName in this.mapping ) {
            var fieldElem = elem.getElementsByTagName( elemName )[0];
            
            var fieldInfo = this.mapping[ elemName ];
            var fieldName = fieldInfo.name;
            var label = fieldInfo.label;
            var type = fieldInfo.type;
            var value = fieldInfo.value;
            var desc = fieldInfo.desc;
            var required = fieldInfo.required;
            var options = fieldInfo.options;
            
            var newFieldElem = newRoot.appendChild( doc.createElement( "field" ) );
            var valueElem = newFieldElem.appendChild( doc.createElement( "value" ) );
            
            newFieldElem.setAttribute( "var", fieldName );
            if( label ) {
                newFieldElem.setAttribute( "label", label );
            }
            if( desc ) {
                newFieldElem.setAttribute( "desc", desc );
            }
            if( required ) {
                newFieldElem.setAttribute( "required", required );
            }
            
            if( options ) {
                // TODO
            }
            
            
            if( fieldInfo.value) {
                valueElem.textContent = fieldInfo.value;
            }
            
        }

        return DataFormEmulator.superclass.read.call( this, newRoot );
    }, 
    
    /**
     * Writes to the given node, using the mapping provided to the constructor.
     *
     * @param node {Element} The parent node to append to.
     */
    write : function(node) {
        var doc = node.ownerDocument;
        //var newNode = this.node.cloneNode(true);
        //newNode = node.ownerDocument.importNode( newNode, true );
        

        for( var elemName in this.mapping ) {
            var fieldElem = node.appendChild( doc.createElement( elemName ) );
            var fieldInfo = this.mapping[ elemName ];
            
            fieldElem.textContent = this.getFieldValues( fieldInfo.name )[0];
        }
        
        return node;
    }

}

Ext.extend( DataFormEmulator, DataForm, DataFormEmulator.prototype);


/**
 * Creates dynamic forms based on a DataForm element. 
 * 
 * @class DataFormView
 * @param dataForm {DataForm} The dataform to bind to
 * @param formId {String} The ID for this form (unique in the document)
 * @param template {String} Optional. The path to an HTML or XSL sheet to represent the form.
 * @todo extend BoxComponent instead.
 * @constructor
 */
function DataFormView( config ) {
    
    // dataForm, formId, template
    if( arguments.length > 1 ) {
;;;        console.warn( "Using deprecated ctor for DataFormView" );
        
        config = {
          dataForm: arguments[0],
          formId: arguments[1],
          template: arguments[2]
        };
    };

    if( !config.template ) {
            config.template = DataFormView.DEFAULT_TEMPLATE;
    }
    this.dataForm = config.dataForm;
    this.formId = config.formId;
    this.template = config.template;

    this.addEvents( {
        /**
         * Called when the submit button is clicked. 
         * @event submit
         * @param dataFormView {DataFormView} this
         */
        submit : true,
        /**
         * Called when the reset button is clicked. 
         * @event submit
         * @param dataFormView {DataFormView} this
         */
        reset : true,
        /**
         * Called when the cancel button is clicked. 
         * @event cancel
         * @param dataFormView {DataFormView} this
         */
        cancel : true
    });
    
    this.dfvContainerId = Ext.id();
    
    var superConfig = Ext.apply( config, {
        layout: 'fit',
        deferredRender: false,
        
        items: {
            id: this.dfvContainerId
        },
        buttons: [{
            text: "Cancel",
            scope: this,
            handler: this.cancelClicked
        },
        {
            text: "Reset",
            scope: this,
            handler: this.resetClicked
        },
        {
            text: "Save",
            scope: this,
            handler: this.saveClicked
        }]
    });
    
    DataFormView.superclass.constructor.call( this, superConfig );
    
}

DataFormView.DEFAULT_TEMPLATE = "resources/xmpp4js/DataForm-to-HTML.xsl";

DataFormView.prototype = {
    
    /**
     * @deprecated in favor of renderAndReturn
     */
    getRenderedNode: function() {
;;;        console.warn( "renderAndReturn is deprecated." );
        return this.renderAndReturn();
    },
    
    /**
     * Returns an HTML element (dom) that is the result of the 
     * rendered node bound with the data form.
     * @return {Element}
     */
    renderAndReturn : function() {
    	
    	var resultDoc = null;
    	
    	// TODO make a template adapter instead of this if/else
    	if( this.template.endsWith(".xsl") ) {
    	
    		// create a temp document to transform
    		var xmlDoc = document.implementation.createDocument("", "", null);
    		// clone and import our node to the new document
    		var node = importNode( xmlDoc, this.dataForm.node.cloneNode(true), true );
    		xmlDoc.appendChild( node );
    		
    		// get the dataform xsl sheet
    		var xhreq = new XMLHttpRequest();
    		xhreq.open("GET", this.template, false);
    		xhreq.send(null);
    		var xslDoc = xhreq.responseXML;
    		
    		// setup the xsl processor
    		var xslProc = new XSLTProcessor();
    		xslProc.setParameter( null, "formId", this.formId );
    		xslProc.importStylesheet(xslDoc);
    		
    		// run the transformation
    		resultDoc = xslProc.transformToDocument(xmlDoc);
    		
    	} else {
    		// get the dataform template
    		var xhreq = new XMLHttpRequest();
    		xhreq.open("GET", this.template, false);
    		xhreq.send(null);
    
            if( xhreq.responseXML != null ) {
    		  resultDoc = xhreq.responseXML;
            } else {
                // TODO parse responseText fragment into document
                throw new Error( "non-XML response. cannot parse fragments at this time" );
            }
    	}
    	
    	// return the result
    	return resultDoc;
    },
    
    /**
     * Renders the form and appends it to parentNode
     * @param parentNode {Element} The element to append the form to.
     */
    onRender : function(ct, position) {
    	var dfvContainer = Ext.ComponentMgr.get( this.dfvContainerId );
         
    	var doc = this.renderAndReturn();
        
        if( doc == null ) {
            throw new Error( "Error rendering DataForm with template: " + this.template );
        }
/*    	
    	var serializer = new XMLSerializer();
    	var xml = serializer.serializeToString(doc);
*/
        var importedNode = document.importNode( doc.documentElement, true );
        //dfvContainer.body.dom.appendChild( importedNode );
    	ct.body.dom.appendChild( importedNode );
         
    	this.bindToForm();
    },
    
    
    /**
     * Bind to a form that exists within the document and has this.formId.
     */
    bindToForm : function() {
    	var formElem = document.getElementById("form-" + this.formId);
    	if(formElem==null) { return; }
    	
    	
    	var submitButton = document.getElementById(this.formId + "-submit");
        var cancelButton = document.getElementById(this.formId + "-cancel");
    	
        if( cancelButton != null ) {
            Ext.EventManager.on(cancelButton, "click", this.cancelClicked, this);
    	}
        
        if( submitButton != null ) {
            Ext.EventManager.on(submitButton, "click", this.submitClicked, this);
        }
    },
    /**
     * Returns an instance of the dataForm being bound to.
     * @return {DataForm}
     */ 
    getDataForm : function() {
        return this.dataForm;
    },
    /**
     * The handler for when the submit button is clicked. Fires the "submit" event.
     */
    submitClicked : function() {
    	var fields = this.dataForm.getFieldNames();
    	for( var i = 0; i < fields.length; i++ ) {
    		var fieldName = fields[i];
    		var fieldType = this.dataForm.getFieldType( fieldName );
    		
    		switch( fieldType ) {
    			case 'boolean':
    				var value = null;
    			
    				var elem = document.getElementById( this.formId + "-" + fieldName + "-0" );
    				if( elem.checked ) {
    					value = "0";
    				}
    				elem = document.getElementById( this.formId + "-" + fieldName + "-1" );
    				if( elem.checked ) {
    					value = "1";
    				}
    				
    				this.dataForm.setFieldValues( fieldName, value );
    				
    				break;
    			case 'list-multi':
    			case 'list-single':
    				var elem = document.getElementById( this.formId + "-" + fieldName );
    				
    				var values = [];
    				
    				for(var j = 0; j < elem.options.length; j++ ) {
    					var optionElem = elem.options[j];
    					if(optionElem.selected) {
    						values.push(optionElem.value);
    					}
    				}
    				
    				this.dataForm.setFieldValues( fieldName, values );
    				break;
    			default:
    				var elem = document.getElementById( this.formId + "-" + fieldName );
    				if(elem == null ) { continue; }
    				
    				this.dataForm.setFieldValues( fieldName, elem.value );
    		}
    	}
    	
    	this.fireEvent( "submit", this );
    },
    
    cancelClicked : function() {
        this.fireEvent( "cancel", this );
    },
    resetClicked : function() {
        this.fireEvent( "reset", this );
    }
}

Ext.extend( DataFormView, Ext.Panel, DataFormView.prototype);

/*
Event.observe( window, "load", function(e) {
	var myXMLHTTPRequest = new XMLHttpRequest();
	myXMLHTTPRequest.open("GET", "javascripts/xmpp4js/ext/DataForm-to-HTML.xml", false);
	myXMLHTTPRequest.send(null);
	
	var testDataFormDoc = myXMLHTTPRequest.responseXML;
	
	var df = new DataForm();
	df.read( testDataFormDoc.documentElement );
	
	var dfw = new DataFormWindow( df, "myform123" );
	dfw.onSubmit = function(dfw) {
		var serializer = new XMLSerializer();
		var xml = serializer.serializeToString(dfw.dataForm.node);
		
		alert( "Res: " + xml );
	}
	
	dfw.show();
	
	//var resultNode = dfw.renderAndReturn();  
});
*/


// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

/**
 * Implementation of XEP-0049 - Private XML Storage
 * @constructor
 */
function DataStorage(con) {
	this.con = con;
}

DataStorage.prototype.set = function( xmlns, data, elementName ) {
	if( !elementName ) { elementName = "element"; }

	var iq = this.con.getPacketHelper().createIQ( null, "set", "jabber:iq:private" );
	var contentNode = iq.getQuery().appendChild( iq.getDoc().createElement( elementName ) );
	contentNode.setAttribute( "xmlns", xmlns );	

	if( typeof(data) == 'string' ) {
		contentNode.setTextContent( data );
	} else {
		contentNode.appendChild( data );
	}

	this.con.send( iq, function(packet) {
		if( packet.getType() == "error" ) {
			alert( "Error storing IQ: "+xmlns + ", " + elementName );
			return;
		}
	});

}

DataStorage.prototype.get = function( xmlns, cb, elementName ) {
	if( !elementName ) { elementName = "element"; }

	var iq = this.con.getPacketHelper().createIQ( null, "get", "jabber:iq:private" );
	var contentNode = iq.getQuery().appendChild( iq.getDoc().createElement( elementName ) );
	contentNode.setAttribute( "xmlns", xmlns );	


	this.con.send( iq, function(packet) {
		if( packet.getType() == "error" ) {
			alert( "Error retreiving IQ: "+xmlns + ", " + elementName );
			return;
		}
		var responseNodes = packet.getQuery().getElementsByTagNameNS( xmlns, elementName );
		cb( responseNodes );
	});
	
}


DataStorage.prototype.setString = function setData(xmlns, data, elementName ) {
	this.set( xmlns, data, elementName );
}

DataStorage.prototype.getString = function getData(xmlns, cb, elementName ) {
	this.get( xmlns, function(responseNodes) {
		var value = "";
		// don't take the response node itself, but use everything inside it.
		$A( responseNodes[0].childNodes ).each( function( node ) {
			value += node.xml;
		});
		cb( value );
	}, elementName );
}

// Copyright (C) 2007  Harlan Iverson <h.iverson at gmail.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

/**
 * @constructor
 */
function ServiceDiscoManager( con ) { 
        this.addEvents({
            /**
             * @param {Jid} jid the originating JID
             * @param {String} node the originating node
             * @param {Array} identities
             * @param {Array} features
             */
            inforesponse: true,
            /**
             * @param {Jid} jid the originating JID
             * @param {String} node the originating node
             * @param {Array} items an array of items, each an object with
             *                      jid, name, action, node
             */
            itemresponse: true
        });
    
    
	this.con = con;
}

ServiceDiscoManager.prototype = {
    /**
     * 
     * @private
     */
    registerPacketListeners: function() {
        this.con.addPacketListener( this.onDiscoItemsRequest.bind(this), new Xmpp4Js.PacketFilter.IQQueryNSFilter("http://jabber.org/protocol/disco#items") );
        this.con.addPacketListener( this.onDiscoIInfoRequest.bind(this), new Xmpp4Js.PacketFilter.IQQueryNSFilter("http://jabber.org/protocol/disco#info") );
    },
    
    /**
     * Discovers information of a given XMPP entity addressed by 
     * its JID and note attribute. Use this message only when trying to query 
     * information which is not directly addressable. Information is
     * returned via the 'inforesponse' event.
     *
     * @param {Jid or String} jid the entity to discover information on
     * @param {String} node optional, the node on the entitiy to discover information about.
     */
    discoverInfo : function( jid, node ) {
            var packet = this.con.getPacketHelper().createIQ(jid, "get", "http://jabber.org/protocol/disco#info");
            packet.setId( "disco_info_"+jid );

            var query = packet.getQuery();

            if( node ) {
                    query.setAttribute( "node", node );
            }

            // TODO should this time out?
            this.con.send( packet, this.onDiscoInfoResponse.bind(this)); 
    },

    /**
     * Returns the discovered items of a given XMPP entity addressed by its 
     * JID and note attribute. Use this message only when trying to query 
     * information which is not directly addressable.
     */
    discoverItems : function( jid, node ) {
            var packet = this.con.getPacketHelper().createIQ(jid, "get", "http://jabber.org/protocol/disco#items");
            
            var query = packet.getQuery();

            if( node ) {
                    query.setAttribute( "node", node );
            }

            // TODO should this time out?
            this.con.send( packet, this.onDiscoItemsResponse.bind(this)); 
    },
    
    /**
     * @private
     */
    features : [],

    /**
     * Registers that a new feature is supported by this XMPP entity. When this 
     * client is queried for its information the registered features will be 
     * answered.
     *
     * Since no packet is actually sent to the server it is safe to perform this 
     * operation before logging to the server. In fact, you may want to configure 
     * the supported features before logging to the server so that the information 
     * is already available if it is required upon login. 
     *
     * @param {String} feature the feature to register as supported.
     */
    addFeature : function( feature ) {
        this.features[ feature ] = true;
    },

    /**
     * Returns true if the specified feature is registered in the ServiceDiscoveryManager.
     * @param {String} feature the feature to look for.
     * @return {Boolean} a boolean indicating if the specified featured is registered or not.
     */
    includesFeature : function( feature ) {
        return this.features[ feature ] != undefined;
    },

    /**
     * Removes the specified feature from the supported features by this XMPP entity.
     * 
     * Since no packet is actually sent to the server it is safe to perform this 
     * operation before logging to the server. 
     *
     * @param {String} feature the feature to remove from the supported features.
     */
    removeFeature : function( feature ) {
        delete this.features[ feature ];
    },

    /**
     * Returns the supported features by this XMPP entity.
     *
     * @return {Array} an array of strings, each feature.
     */
    getFeatures : function() {
        var features = [];

        for( var k in this.features ) {
            features.push(k);
        }

        return features;
    },
    
    
    /**
     * Respond to service discovery requests for items.
     * 
     * Currently no items are returned, but the future should bring a hook
     * or registry for items.
     * @param {Xmpp4Js.Packet.IQ} requestIq the request packet.
     * @private
     */
    onDiscoItemsRequest : function(requestIq) {
        var response = this.con.getPacketHelper().createIQ( requestIq.getFrom(), "result", "http://jabber.org/protocol/disco#items" );
        response.setId( requestIq.getId() );
        
        this.con.send( response );

    },
    
    /**
     * Respond to service discovery requests for info.
     * 
     * Features are registered by using the addFeature method.
     *
     * @param {Xmpp4Js.Packet.IQ} requestIq the request packet.
     * @private
     */
    onDiscoIInfoRequest : function(requestIq) {
        var response = this.con.getPacketHelper().createIQ( requestIq.getFrom(), "result", "http://jabber.org/protocol/disco#info" );
        response.setId( requestIq.getId() );
        
        var queryNode = response.getQuery();
        var doc = queryNode.ownerDocument;
        
        for( var i = 0; i < this.features.length; i++ ) {
            var feature = this.features[i];
            
            var featureNode = doc.createElement( "feature" );
            featureNode.setAttribute( "var", feature );
            queryNode.appendChild( featureNode );
        }
        
        this.con.send( response );
    },
    
    /**
     * @private
     */
    onDiscoItemsResponse: function(responsePacket) {
        if( responsePacket.getType() == "error" ) {
            // throw new eception: response.getError()
            return;
        }

        var items = [];

        var responseQuery = responsePacket.getQuery();
        if( responseQuery == null ) {
            return; // TODO are responses with no query allowed?
        } 
        
        var itemNodes = responseQuery.childNodes;
        for ( var i=0; i < itemNodes.getLength(); i++ ) {
            var item = itemNodes.item( i );
            if( item.nodeName == "item" ) {
                items.push({
                    jid: item.getAttribute( "jid" ),
                    name: item.getAttribute( "name" ),
                    action: item.getAttribute( "action" ),
                    node: item.getAttribute( "node" )
                });
            }
        }

        this.fireEvent( "itemresponse", new Jid(jid), node, items );
    },
    
    /**
     * @private
     */
    onDiscoInfoResponse: function(responsePacket) {
        if( responsePacket.getType() == "error" ) {
            // throw new eception: response.getError()	
            return;
        }

        var identities = []
        var features = [];

        var responseQuery = responsePacket.getQuery();
        if( responseQuery == null ) {
            return; // TODO are responses with no query allowed?
        } 
        var itemNodes = responseQuery.childNodes;

        for ( var i=0; i < itemNodes.getLength(); i++ ) {
            var item = itemNodes.item( i );

            if( item.nodeName == "identity" ) {
                identities.push({
                    category: item.getAttribute( "category" ),
                    name: item.getAttribute( "name" ),
                    type: item.getAttribute( "type" )
                });
            } else if( item.nodeName == "feature" ) {
                features.push( item.getAttribute( "var" ) );
            }
        }

        this.fireEvent( "inforesponse", new Jid(jid), node, identities, features );
    }

};


ServiceDiscoManager.instances = {};
ServiceDiscoManager.getInstanceFor = function(con) {
    var instances = ServiceDiscoManager.instances;
    
    if( instances[con.id] === undefined ) {
        instances[con.id] = new ServiceDiscoManager( con );
    }

    return instances[con.id];
};

Ext.extend( ServiceDiscoManager, Ext.util.Observable, ServiceDiscoManager.prototype );






/**
 * @constructor
 */
function TransportHelper() {

}

/** Calls back with the identity of each gateway individually. 
TODO this can be more abstracted for general discovery tasks
*/
TransportHelper.discoverGateways = function( sdm, cb ) {


	var checkedJids = {};

	// recursively discovers AIM by first checking info,
	// then checking all items
	var discoverGateways = function( jid ) {
		if( checkedJids[ jid ] ) {
			return; // no need to query more than once
		}
		checkedJids[ jid ] = true;
		sdm.discoverInfo( jid, function( infoJid, identities, features ) {
			for( var i = 0; i < identities.length; i++ ) {
				var ident = identities[ i ];
				if( ident.category == "gateway" ) {
					cb( infoJid, ident );
				}
			}

			// if discoverInfo didn't find any results, then
			// recursively search items
			sdm.discoverItems( infoJid, function( itemsJid, items ) {
				for( var i = 0; i < items.length; i++ ) {
					var item = items[ i ];
					
					discoverGateways( item.jid );
				}
			} );

		} );   
	};

	// discover starting on the bare hostname
	discoverGateways( sdm.con.domain );

}

TransportHelper.registerForAim = function( con, gatewayJid, screenName, password ) {
/*
	var sdm = con.getServiceDisco();

	sdm.discoverInfo( gatewayJid, function( jid, identities, features ) {
		var canRegister = false; // check features

		for( var i = 0; i < features.length; i++ ) {
			var feat = features[ i ];
			if( feat == "jabber:iq:register" ) {
				canRegister = true;
			}
		}

		if( !canRegister ) { 
            throw new Error( "Can not register for transport on "+gatewayJid );
        }
*/
		// first get fields we will need to register
		var iq = con.getPacketHelper().createIQ(gatewayJid, "get", "jabber:iq:register");
		iq.setId( "get_aim_" + screenName );
	
        // FIXME once again this bug with listeners comes out. fuck.
		con.send( iq, function( packet ) {
			// then set the data TODO this ignores retreived field names
			var iq = con.getPacketHelper().createIQ(gatewayJid, "set", "jabber:iq:register");
			iq.setId( "set_aim_" + screenName );


			// reuse the incoming query form
			//var query = iq.getDoc().importNode( packet.getQuery(), true );
			//iq.appendChild( query );

			//var regForm = query.firstChild;	

			var query = iq.getQuery();
			
			query.appendChild( iq.getDoc().createElement( "username" ) ).setTextContent( screenName );
			query.appendChild( iq.getDoc().createElement( "password" ) ).setTextContent( password );

			con.send( iq, function( packet ) {
				if( packet.getType() == "error" ) {
					alert( "There was a problem trying to register the screen name " + screenName );
					return;
				}
				
				// on Openfire/PyAIMt this seems to be done auto
				con.getRoster().createEntry( gatewayJid );

				// explicitly send available packet to gateway... TODO is this needed?
				var pres = con.getPacketHelper().createPresence();
                pres.setTo( gatewayJid );
				con.send( pres );
			} );

		} );
	//} );
}

Ext.namespace( "Xmpp4Js.Workflow" );

/**
 * @class Encapsulates the login process for a given connection. 
 *        TODO look into whether a connection may authenticate multuiple times
 *             and cleanly change credentials. If not, throw an error if we're
 *             already authenticated.
 * @param {Object} config Specify con.
 */
Xmpp4Js.Workflow.Login = function(config) {
    /**
     * @private
     * @type Xmpp4Js.Connection
     */
    this.con = config.con;
         
    /**
     * Picked up by Observable.
     * @private
     */
    this.listeners = config.listeners;

    this.addEvents({
        /**
         * @event success
         * The login was successful.
         * TODO make more specific details be returned: jid
         * @param {Xmpp4Js.Packet.IQ} responseIq
         */
        success: true,
        /**
         * @event failure
         * The login failed.
         * TODO make more specific details be returned: code, message
         * @param {Xmpp4Js.Packet.IQ} responseIq
         */
        failure: true
    });
    
    Xmpp4Js.Workflow.Login.superclass.constructor.call( this, config );
}

Xmpp4Js.Workflow.Login.prototype = {
    /**
     * Sent an AuthPlainText packet constructed with passed arguments (resource 
     * is xmpp4js if none is specified). Intercept the response and fire 'success'
     * or 'failure' events accordingly.
     */
    start: function(type, username, password, resource) {
        if( !resource ) { resource = 'xmpp4js'; };
        
        if( type=="plaintext" ) {
            this.authPlaintext( username, password, resource );
        } else if( type == "anon" ) {
            this.authAnon();
        }

    },
    
    authPlaintext: function( username, password, resource ) {
        var iq = new Xmpp4Js.Packet.AuthPlainText( username, password, resource );


        iq.setTo( this.con.domain /* FIXME getDomain */ );
        this.con.send( iq, function( responseIq ) {
            if( responseIq.getType() == "error" ) {
                this.fireEvent( "failure", responseIq );
            } else {
                // FIXME this is borderline between belonging here and
                //       belonging as a listener in Connection. we surely
                //         should at least have a setJid or setCredentials method.
                this.con.jid = responseIq.getTo();
                
                this.fireEvent( "success", responseIq );
            }
        }.bind(this) );
    },
    
    authAnon: function() {
        var iq = new Xmpp4Js.Packet.IQ( this.domain, "set", "jabber:iq:auth" );

        this.con.send( iq, function( responseIq ) {
            if( responseIq.getType() == 'error' ) {
                this.fireEvent( "failure", responseIq );
            } else { 
                // FIXME this is borderline between belonging here and
                //       belonging as a listener in Connection. we surely
                //         should at least have a setJid or setCredentials method.
                this.con.jid = responseIq.getTo();
                
                this.fireEvent( "success", responseIq );
            }
        }.bind(this) );
    }
};

Ext.extend( Xmpp4Js.Workflow.Login, Ext.util.Observable, Xmpp4Js.Workflow.Login.prototype );
Ext.namespace( "Xmpp4Js.Workflow" );

/**
 * @class Encapsulates the login process for a given connection. 
 *        TODO look into whether a connection may authenticate multuiple times
 *             and cleanly change credentials. If not, throw an error if we're
 *             already authenticated.
 * @param {Object} config Specify con.
 */
Xmpp4Js.Workflow.Registration = function(config) {
    /**
     * @private
     * @type Xmpp4Js.Connection
     */
    this.con = config.con;
         
    /**
     * Picked up by Observable.
     * @private
     */
    this.listeners = config.listeners;
    
    /**
     * The address to send the request to. Default to JID of conn
     * @private
     */
    this.toJid = config.toJid || this.con.domain;

    this.addEvents({
        /**
         * @event success
         * The registration was successful.
         * TODO make more specific details be returned: jid, password, etc
         * @param {Xmpp4Js.Packet.IQ} responseIq
         */
        success: true,
        /**
         * @event failure
         * The registration failed.
         * TODO make more specific details be returned: code, message
         * @param {Xmpp4Js.Packet.IQ} responseIq
         */
        failure: true
    });
    
    Xmpp4Js.Workflow.Registration.superclass.constructor.call( this, config );
}

Xmpp4Js.Workflow.Registration.prototype = {
    /**
     * @param {Object} fields An object with username, password, etc.
     */
    start: function(fields) {
        var iq = new Xmpp4Js.Packet.Registration(this.toJid, fields );
        this.con.send( iq, this.onRegResponse.bind(this) );
    },
    
    /**
     * @private
     */
    onRegResponse: function(responseIq) {
        if( responseIq.getType() == "error" ) {
            this.fireEvent( "failure", responseIq );
        } else if( responseIq.getType() == "result" ) {
            this.fireEvent( "success", responseIq );
        }
    }
};

Ext.extend( Xmpp4Js.Workflow.Registration, Ext.util.Observable, Xmpp4Js.Workflow.Registration.prototype );
